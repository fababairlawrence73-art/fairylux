<?php

namespace App\Services;

use Exception;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FirestoreService
{
    private const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
    private const TOKEN_ENDPOINT  = 'https://oauth2.googleapis.com/token';

    /**
     * Create a notification document under:
     *   users/{firebaseUid}/notifications/{notificationId}
     *
     * @param  string  $firebaseUid  The customer's Firebase UID
     * @param  array   $data         Notification payload fields
     * @return bool  true on success, false if not configured or on failure
     */
    public function createNotification(string $firebaseUid, array $data): bool
    {
        $projectId = config('services.firebase.project_id');
        $saPath    = config('services.firebase.service_account_path');

        if (!$saPath || !file_exists($saPath)) {
            Log::warning('[FirestoreService] Service account path not configured or file missing. Skipping notification write.', [
                'firebase_uid' => $firebaseUid,
                'path'         => $saPath,
            ]);
            return false;
        }

        try {
            $accessToken = $this->getAccessToken($saPath);
            $notifId     = Str::uuid()->toString();
            $collection  = "users/{$firebaseUid}/notifications";
            $url         = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/{$collection}";

            // Build Firestore REST document fields
            $fields = $this->toFirestoreFields(array_merge($data, [
                'read'      => false,
                'createdAt' => ['__serverTimestamp' => true],
            ]));

            $response = Http::timeout(10)
                ->withToken($accessToken)
                ->post($url, ['fields' => $fields]);

            if ($response->successful()) {
                Log::info('[FirestoreService] Notification created.', [
                    'firebase_uid'   => $firebaseUid,
                    'notification_id'=> $notifId,
                    'type'           => $data['type'] ?? 'order_status',
                ]);
                return true;
            }

            Log::error('[FirestoreService] Firestore write failed.', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return false;

        } catch (Exception $e) {
            Log::error('[FirestoreService] Exception writing notification.', [
                'message'     => $e->getMessage(),
                'firebase_uid'=> $firebaseUid,
            ]);
            return false;
        }
    }

    /**
     * Obtain (or return cached) a Google OAuth2 access token
     * using a service-account JWT assertion.
     */
    private function getAccessToken(string $saPath): string
    {
        return Cache::remember('firestore_access_token', 55 * 60, function () use ($saPath) {
            $sa = json_decode(file_get_contents($saPath), true);

            if (!$sa || empty($sa['private_key']) || empty($sa['client_email'])) {
                throw new Exception('Invalid service account JSON: missing private_key or client_email.');
            }

            $now = time();

            $payload = [
                'iss'   => $sa['client_email'],
                'scope' => self::FIRESTORE_SCOPE,
                'aud'   => self::TOKEN_ENDPOINT,
                'exp'   => $now + 3600,
                'iat'   => $now,
            ];

            $jwtAssertion = JWT::encode($payload, $sa['private_key'], 'RS256');

            $response = Http::asForm()->timeout(10)->post(self::TOKEN_ENDPOINT, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwtAssertion,
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to obtain Google OAuth2 access token: ' . $response->body());
            }

            return $response->json('access_token');
        });
    }

    /**
     * Convert a PHP array to Firestore REST API field format.
     * Supports: string, integer, double, boolean, null, and nested maps.
     * Special key: ['__serverTimestamp' => true] is converted to serverTimestamp.
     */
    private function toFirestoreFields(array $data): array
    {
        $fields = [];

        foreach ($data as $key => $value) {
            $fields[$key] = $this->toFirestoreValue($value);
        }

        return $fields;
    }

    private function toFirestoreValue(mixed $value): array
    {
        if ($value === null) {
            return ['nullValue' => null];
        }

        if (is_bool($value)) {
            return ['booleanValue' => $value];
        }

        if (is_int($value)) {
            return ['integerValue' => (string) $value];
        }

        if (is_float($value)) {
            return ['doubleValue' => $value];
        }

        if (is_array($value)) {
            // Special marker for server timestamp
            if (isset($value['__serverTimestamp']) && $value['__serverTimestamp'] === true) {
                return ['timestampValue' => gmdate('Y-m-d\TH:i:s\Z', time())];
            }

            // Nested map
            $mapFields = [];
            foreach ($value as $k => $v) {
                $mapFields[$k] = $this->toFirestoreValue($v);
            }
            return ['mapValue' => ['fields' => $mapFields]];
        }

        // Default: string
        return ['stringValue' => (string) $value];
    }
}
