# 🗂️ Configuração do Supabase Storage

## 📦 Buckets Necessários

### 1. **product-images** - Imagens de produtos
- Tipo: `public`
- Tamanho máximo: 5MB por arquivo
- Formatos: JPG, PNG, WEBP

### 2. **verification-videos** - Vídeos de verificação (escrow)
- Tipo: `private`
- Tamanho máximo: 50MB por arquivo
- Formatos: MP4, MOV

### 3. **avatars** - Fotos de perfil
- Tipo: `public`
- Tamanho máximo: 2MB por arquivo
- Formatos: JPG, PNG, WEBP

### 4. **forum-images** - Imagens do fórum
- Tipo: `public`
- Tamanho máximo: 5MB por arquivo
- Formatos: JPG, PNG, WEBP, GIF

---

## 🔧 Passo a Passo para Criar os Buckets

### Via Dashboard (Recomendado)

1. **Acesse:** [https://app.supabase.com](https://app.supabase.com)
2. **Selecione seu projeto:** kpozlrvizpuekiteiece
3. **Vá em:** Storage → Buckets
4. **Clique em:** "New bucket"

#### Criar cada bucket:

**Bucket 1: product-images**
- Name: `product-images`
- Public: ✅ (checkbox marcado)
- File size limit: `5242880` (5MB em bytes)
- Allowed MIME types: `image/jpeg,image/png,image/webp`
- Clique em "Create bucket"

**Bucket 2: verification-videos**
- Name: `verification-videos`
- Public: ❌ (checkbox desmarcado)
- File size limit: `52428800` (50MB em bytes)
- Allowed MIME types: `video/mp4,video/quicktime`
- Clique em "Create bucket"

**Bucket 3: avatars**
- Name: `avatars`
- Public: ✅ (checkbox marcado)
- File size limit: `2097152` (2MB em bytes)
- Allowed MIME types: `image/jpeg,image/png,image/webp`
- Clique em "Create bucket"

**Bucket 4: forum-images**
- Name: `forum-images`
- Public: ✅ (checkbox marcado)
- File size limit: `5242880` (5MB em bytes)
- Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`
- Clique em "Create bucket"

---

## 🔒 Políticas de Segurança (RLS)

Após criar os buckets, vá em **Storage → Policies** e adicione as políticas abaixo:

### Para `product-images`:

**1. Allow public read**
- Policy name: `Public can view product images`
- Policy definition:
```sql
bucket_id = 'product-images'
```
- Allowed operations: `SELECT`

**2. Allow authenticated users to upload**
- Policy name: `Authenticated users can upload product images`
- Policy definition:
```sql
bucket_id = 'product-images' AND auth.role() = 'authenticated'
```
- Allowed operations: `INSERT`

**3. Allow users to delete own images**
- Policy name: `Users can delete own product images`
- Policy definition:
```sql
bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- Allowed operations: `DELETE`

---

### Para `verification-videos`:

**1. Allow users to view own videos**
- Policy name: `Users can view own verification videos`
- Policy definition:
```sql
bucket_id = 'verification-videos' AND auth.uid()::text = (storage.foldername(name))[1]
```
- Allowed operations: `SELECT`

**2. Allow users to upload own videos**
- Policy name: `Users can upload verification videos`
- Policy definition:
```sql
bucket_id = 'verification-videos' AND auth.role() = 'authenticated'
```
- Allowed operations: `INSERT`

---

### Para `avatars`:

**1. Allow public read**
- Policy name: `Public can view avatars`
- Policy definition:
```sql
bucket_id = 'avatars'
```
- Allowed operations: `SELECT`

**2. Allow users to upload own avatar**
- Policy name: `Users can upload own avatar`
- Policy definition:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```
- Allowed operations: `INSERT`, `UPDATE`

**3. Allow users to delete own avatar**
- Policy name: `Users can delete own avatar`
- Policy definition:
```sql
bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
```
- Allowed operations: `DELETE`

---

### Para `forum-images`:

**1. Allow public read**
- Policy name: `Public can view forum images`
- Policy definition:
```sql
bucket_id = 'forum-images'
```
- Allowed operations: `SELECT`

**2. Allow authenticated users to upload**
- Policy name: `Authenticated users can upload forum images`
- Policy definition:
```sql
bucket_id = 'forum-images' AND auth.role() = 'authenticated'
```
- Allowed operations: `INSERT`

**3. Allow users to delete own images**
- Policy name: `Users can delete own forum images`
- Policy definition:
```sql
bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]
```
- Allowed operations: `DELETE`

---

## 📁 Estrutura de Pastas

Os arquivos serão organizados assim:

```
product-images/
├── {user_id}/
│   ├── {product_id}/
│   │   ├── image_1.jpg
│   │   ├── image_2.jpg
│   │   └── ...

verification-videos/
├── {user_id}/
│   ├── {transaction_id}/
│   │   └── verification.mp4

avatars/
├── {user_id}/
│   └── avatar.jpg

forum-images/
├── {user_id}/
│   ├── {post_id}/
│   │   ├── image_1.jpg
│   │   └── ...
```

---

## 🧪 Testar Storage

Após configurar tudo, teste com este comando Python:

```python
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# Upload de teste
with open("test.jpg", "rb") as f:
    result = supabase.storage.from_("product-images").upload(
        "test/test.jpg",
        f,
        {"content-type": "image/jpeg"}
    )
    print(result)

# Get URL pública
url = supabase.storage.from_("product-images").get_public_url("test/test.jpg")
print(f"URL: {url}")
```

---

## ✅ Checklist

- [ ] Bucket `product-images` criado
- [ ] Bucket `verification-videos` criado
- [ ] Bucket `avatars` criado
- [ ] Bucket `forum-images` criado
- [ ] Políticas de segurança configuradas
- [ ] Teste de upload realizado

---

**Pronto!** ✨ Storage configurado e seguro!
