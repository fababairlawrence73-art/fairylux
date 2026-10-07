<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FirebaseTokenService
{
    private const CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    /**
     * Verify a Firebase ID token and return its verified payload.
     *
     * @param string $token
     * @return object
     * @throws Exception
     */
    public function verifyIdToken(string $token): object
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Malformed JWT: Expected 3 segments.');
        }

        // Decode header without verifying yet to get 'kid' and 'alg'
        $headerRaw = base64_decode(strtr($parts[0], '-_', '+/'));
        $header = json_decode($headerRaw);

        if (!$header || empty($header->kid) || empty($header->alg)) {
            throw new Exception('Invalid JWT header: Missing kid or alg.');
        }

        if ($header->alg !== 'RS256') {
            throw new Exception("Unsupported JWT algorithm: {$header->alg}. Expected RS256.");
        }

        $kid = $header->kid;
        $certs = $this->getPublicCertificates();

        // If kid is not found in cached certs, force refresh once
        if (!isset($certs[$kid])) {
            Cache::forget('firebase_public_certs');
            $certs = $this->getPublicCertificates();
            if (!isset($certs[$kid])) {
                throw new Exception('Firebase public key not found for kid: ' . $kid);
            }
        }

        $publicKey = $certs[$kid];
        $projectId = config('services.firebase.project_id', 'fairylux');

        // Verify and decode using Firebase\JWT\JWT
        JWT::$leeway = 60; // 60s clock skew tolerance
        $decoded = JWT::decode($token, new Key($publicKey, 'RS256'));

        // Validate Audience
        if ($decoded->aud !== $projectId) {
            throw new Exception("Invalid token audience. Expected: {$projectId}, got: {$decoded->aud}");
        }

        // Validate Issuer
        $expectedIssuer = 'https://securetoken.google.com/' . $projectId;
        if ($decoded->iss !== $expectedIssuer) {
            throw new Exception("Invalid token issuer. Expected: {$expectedIssuer}, got: {$decoded->iss}");
        }

        // Validate Subject (Firebase UID)
        if (empty($decoded->sub)) {
            throw new Exception('Token subject (sub) is empty.');
        }

        return $decoded;
    }

    /**
     * Retrieve and cache Google's public certificates.
     *
     * @return array<string, string>
     */
    public function getPublicCertificates(): array
    {
        return Cache::remember('firebase_public_certs', 3600 * 6, function () {
            $response = Http::timeout(10)->get(self::CERT_URL);
            if (!$response->successful()) {
                throw new Exception('Failed to fetch Google public certificates for Firebase token verification.');
            }
            return $response->json();
        });
    }

    /**
     * Resolve or register a customer User record based on the verified Firebase payload.
     *
     * @param object $payload
     * @return User
     */
    public function resolveUser(object $payload): User
    {
        $firebaseUid = $payload->sub;
        $email = $payload->email ?? null;
        $name = $payload->name ?? ($email ? explode('@', $email)[0] : 'Valued Customer');

        // 1. Look up by Firebase UID
        $user = User::where('firebase_uid', $firebaseUid)->first();

        if ($user) {
            // Update name or email if missing
            if ($email && !$user->email) {
                $user->email = $email;
                $user->save();
            }
            return $user;
        }

        // 2. Look up by verified email if present
        if ($email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->firebase_uid = $firebaseUid;
                $user->save();
                return $user;
            }
        }

        // 3. Create a new Customer user record
        $customerRole = Role::where('slug', 'customer')->first();

        return User::create([
            'name' => $name,
            'email' => $email ?: ($firebaseUid . '@firebase.fairylux.internal'),
            'firebase_uid' => $firebaseUid,
            'role_id' => $customerRole?->id ?? 3,
            'is_active' => true,
            'password' => Hash::make(Str::random(32)),
        ]);
    }
}
