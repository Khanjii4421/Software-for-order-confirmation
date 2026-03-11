-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_name" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "orders_per_day" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_color" TEXT,
    "price" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "source_platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" DATETIME,
    CONSTRAINT "Order_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "shopify_api_key" TEXT,
    "wordpress_webhook" TEXT,
    "custom_api_key" TEXT,
    "whatsapp_connected" BOOLEAN NOT NULL DEFAULT false,
    "meta_app_id" TEXT,
    "meta_phone_number_id" TEXT,
    "meta_access_token" TEXT,
    "meta_business_account_id" TEXT,
    "meta_template_name" TEXT,
    CONSTRAINT "Integration_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIBotConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "openai_api_key" TEXT,
    "ai_model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "wa_phone_number_id" TEXT,
    "wa_access_token" TEXT,
    "wa_verify_token" TEXT DEFAULT 'ai_bot_secret',
    "bot_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ai_personality" TEXT DEFAULT 'friendly',
    "custom_prompt" TEXT,
    "product_name" TEXT,
    "product_description" TEXT,
    "product_price" REAL,
    "product_min_price" REAL,
    "currency" TEXT DEFAULT 'PKR',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AIBotConfig_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bot_config_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_name" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_bot_config_id_fkey" FOREIGN KEY ("bot_config_id") REFERENCES "AIBotConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bot_config_id" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_name" TEXT,
    "city" TEXT,
    "address" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'greeting',
    "messages" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AIConversation_bot_config_id_fkey" FOREIGN KEY ("bot_config_id") REFERENCES "AIBotConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "product_name" TEXT,
    "product_image_url" TEXT,
    "final_price" REAL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "confirmation_sent" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIOrder_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AIOrder_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "AIConversation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_email_key" ON "Brand"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_brand_id_key" ON "Integration"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_custom_api_key_key" ON "Integration"("custom_api_key");

-- CreateIndex
CREATE UNIQUE INDEX "AIBotConfig_brand_id_key" ON "AIBotConfig"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "AIOrder_conversation_id_key" ON "AIOrder"("conversation_id");
