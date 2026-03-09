# Chatwoot Agent Dashboard — Guide de Setup

## Prérequis

- PHP 8.2+
- Composer
- Node.js 18+
- Instance Chatwoot self-hosted déployée
- Compte Twilio avec WhatsApp activé

---

## Étape 1 — Créer le projet Laravel 11

```bash
composer create-project laravel/laravel chatwoot-agent
cd chatwoot-agent
```

## Étape 2 — Installer les dépendances

```bash
composer require twilio/sdk
```

## Étape 3 — Copier les fichiers du projet

Copiez tous les fichiers de ce dossier dans votre projet Laravel :

```
# Config
cp config/chatwoot.php           → votre-projet/config/chatwoot.php

# Services
cp app/Services/Chatwoot/*       → votre-projet/app/Services/Chatwoot/
cp app/Services/Twilio/*         → votre-projet/app/Services/Twilio/

# DTOs & Enums
cp app/DTOs/*                    → votre-projet/app/DTOs/
cp app/Enums/*                   → votre-projet/app/Enums/

# Controllers
cp app/Http/Controllers/*.php    → votre-projet/app/Http/Controllers/
cp app/Http/Controllers/Webhook/* → votre-projet/app/Http/Controllers/Webhook/

# Commands
cp app/Console/Commands/*        → votre-projet/app/Console/Commands/

# Routes
# IMPORTANT : Fusionner avec vos routes existantes, ne pas écraser
cp routes/web.php                → votre-projet/routes/web.php
cp routes/api.php                → votre-projet/routes/api.php

# Vues
cp -r resources/views/*          → votre-projet/resources/views/
```

## Étape 4 — Configurer le .env

Ajoutez ces variables à votre fichier `.env` :

```env
# App
APP_NAME="Mercedes Support"

# Chatwoot
CHATWOOT_BASE_URL=https://votre-chatwoot.com
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_API_TOKEN=votre_user_access_token
CHATWOOT_WHATSAPP_INBOX_ID=1
CHATWOOT_POLLING_INTERVAL=4000
CHATWOOT_WEBHOOK_SECRET=generer_un_secret_random

# Twilio
TWILIO_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=votre_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Comment obtenir le CHATWOOT_API_TOKEN :
1. Connectez-vous à votre instance Chatwoot
2. Allez dans **Settings → Profile** (icône avatar en bas à gauche)
3. Section **Access Token** → Copiez le token

### Comment obtenir le CHATWOOT_WHATSAPP_INBOX_ID :
1. Dans Chatwoot, allez dans **Settings → Inboxes**
2. Créez un inbox de type **API** (ou utilisez un existant)
3. L'ID est visible dans l'URL : `/inboxes/X/settings` → X est l'ID

## Étape 5 — Ajouter Twilio dans config/services.php

Ouvrez `config/services.php` et ajoutez le bloc Twilio :

```php
'twilio' => [
    'sid'            => env('TWILIO_SID'),
    'auth_token'     => env('TWILIO_AUTH_TOKEN'),
    'whatsapp_from'  => env('TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886'),
],
```

## Étape 6 — Configurer l'authentification Laravel

```bash
# Installer Breeze (auth simple, Blade)
composer require laravel/breeze --dev
php artisan breeze:install blade
php artisan migrate
npm install && npm run build
```

## Étape 7 — Tester la connexion

```bash
php artisan chatwoot:test
```

Vous devriez voir :
```
🔌 Test de connexion à Chatwoot...
   URL: https://votre-chatwoot.com
   Account ID: 1

1️⃣  Test API...
   ✅ Connexion OK
2️⃣  Récupération des agents...
   ✅ 3 agent(s) trouvé(s)
3️⃣  Récupération des conversations...
   ✅ 5 conversation(s) ouvertes récupérées

🎉 Test terminé !
```

## Étape 8 — Configurer les Webhooks

### A. Webhook Twilio Studio → votre app

Dans votre flow Twilio Studio, au moment du handoff :
1. Ajoutez un widget **"Make HTTP Request"**
2. Méthode : `POST`
3. URL : `https://votre-app.com/api/webhooks/twilio/handoff`
4. Content-Type : `application/json`
5. Body :
```json
{
    "from": "{{trigger.message.From}}",
    "body": "{{trigger.message.Body}}",
    "name": "{{flow.variables.customer_name}}"
}
```

### B. Webhook Chatwoot → votre app

1. Dans Chatwoot : **Settings → Integrations → Configure → Webhooks**
2. URL : `https://votre-app.com/api/webhooks/chatwoot`
3. Événements à cocher :
   - ✅ `message_created`
   - ✅ `conversation_status_changed`

## Étape 9 — Lancer le projet

```bash
php artisan serve
```

Accédez à `http://localhost:8000` → Créez un compte → Accédez au dashboard.

---

## Architecture des fichiers

```
app/
├── Console/Commands/
│   └── ChatwootTestConnection.php    # php artisan chatwoot:test
├── DTOs/
│   └── ConversationDTO.php           # Data Transfer Object
├── Enums/
│   ├── ConversationStatus.php
│   └── MessageType.php
├── Http/Controllers/
│   ├── AgentController.php
│   ├── ConversationController.php    # ⭐ Controller principal
│   ├── DashboardController.php
│   └── Webhook/
│       ├── ChatwootWebhookController.php  # Chatwoot → Twilio
│       └── TwilioWebhookController.php    # ⭐ Twilio → Chatwoot (HANDOFF)
└── Services/
    ├── Chatwoot/
    │   ├── ChatwootClient.php        # ⭐ Client HTTP API
    │   ├── ConversationService.php
    │   ├── MessageService.php
    │   └── ReportService.php
    └── Twilio/
        └── TwilioService.php
```

## Flux de données

```
Client WhatsApp
    ↓ message
Twilio Studio (chatbot)
    ↓ [demande agent]
POST /api/webhooks/twilio/handoff (TwilioWebhookController)
    ↓ Cherche/crée contact + crée conversation
Chatwoot API
    ↓ Conversation apparaît dans le dashboard
Agent voit la conversation (polling toutes les 4s)
    ↓ Agent répond
POST /ajax/conversations/{id}/messages (ConversationController)
    ↓ Envoie message via Chatwoot API
Chatwoot Webhook → POST /api/webhooks/chatwoot (ChatwootWebhookController)
    ↓ Détecte message outgoing
Twilio API → sendWhatsApp()
    ↓
Client reçoit la réponse sur WhatsApp
```
