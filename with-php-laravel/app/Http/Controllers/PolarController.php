<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use StandardWebhooks\Webhook;
use StandardWebhooks\Exception\WebhookVerificationException;
use GuzzleHttp\Client;

class PolarController extends \Illuminate\Routing\Controller
{
    private $accessToken;
    private $webhookSecret;
    private $server;
    private $baseUrl;

    public function __construct()
    {
        $this->accessToken = env('POLAR_ACCESS_TOKEN');
        $this->webhookSecret = env('POLAR_WEBHOOK_SECRET');
        $this->server = env('POLAR_MODE', 'production');
        $this->baseUrl = $this->server === 'sandbox' ? 'https://sandbox-api.polar.sh' : 'https://api.polar.sh';
    }

    private function getClient()
    {
        return new Client([
            'headers' => [
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ]
        ]);
    }

    public function index()
    {
        if (!$this->accessToken) {
            return response("Missing POLAR_ACCESS_TOKEN", 401);
        }

        try {
            $response = $this->getClient()->get($this->baseUrl . '/v1/products/?is_archived=false');
            $data = json_decode($response->getBody()->getContents());
            $items = $data->items ?? [];

            $productLinks = array_map(function($product) {
                return "<div><a target='_blank' href='/checkout?products={$product->id}'>{$product->name}</a></div>";
            }, $items);

            $html = "<html><body>
                <form action='/portal' method='get'>
                    <input type='email' name='email' placeholder='Email' required />
                    <button type='submit'>Open Customer Portal</button>
                </form>
                " . implode('', $productLinks) . "
            </body></html>";

            return response($html, 200, ['Content-Type' => 'text/html']);
        } catch (\Exception $e) {
            return response("Error: " . $e->getMessage(), 500);
        }
    }

    public function checkout(Request $request)
    {
        $productIds = $request->query('products');
        if (!$productIds) {
            return response('Missing products parameter', 400);
        }

        try {
            $response = $this->getClient()->post($this->baseUrl . '/v1/checkouts/', [
                'json' => [
                    'products' => is_array($productIds) ? $productIds : [$productIds],
                    'success_url' => env('POLAR_SUCCESS_URL', $request->getSchemeAndHttpHost() . '/')
                ]
            ]);

            $data = json_decode($response->getBody()->getContents());
            return redirect($data->url);
        } catch (\Exception $e) {
            return response("Error: " . $e->getMessage(), 500);
        }
    }

    public function portal(Request $request)
    {
        $email = $request->query('email');
        if (!$email) {
            return response('Missing email parameter', 400);
        }

        try {
            $response = $this->getClient()->get($this->baseUrl . '/v1/customers/?email=' . urlencode($email));
            $data = json_decode($response->getBody()->getContents());
            $items = $data->items ?? [];
            
            if (empty($items)) {
                return response('Customer not found', 404);
            }

            $customer = $items[0];

            $sessionResponse = $this->getClient()->post($this->baseUrl . '/v1/customer-sessions/', [
                'json' => [
                    'customer_id' => $customer->id
                ]
            ]);

            $sessionData = json_decode($sessionResponse->getBody()->getContents());
            return redirect($sessionData->customer_portal_url);
        } catch (\Exception $e) {
            return response("Error: " . $e->getMessage(), 500);
        }
    }

    public function webhooks(Request $request)
    {
        $payload = $request->getContent();
        $headers = [
            'webhook-id' => $request->header('webhook-id'),
            'webhook-timestamp' => $request->header('webhook-timestamp'),
            'webhook-signature' => $request->header('webhook-signature'),
        ];

        $base64Secret = base64_encode($this->webhookSecret);
        $webhook = new Webhook($base64Secret);
        
        try {
            $webhook->verify($payload, $headers);
            return response()->json(json_decode($payload));
        } catch (WebhookVerificationException $e) {
            return response($e->getMessage(), 403);
        }
    }
}
