# OAuth 소셜 로그인 설정 가이드

이 프로젝트는 카카오 로그인과 Apple 로그인을 지원합니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# 카카오 OAuth
export KAKAO_CLIENT_ID="your-kakao-rest-api-key"
export KAKAO_CLIENT_SECRET="your-kakao-client-secret"  # 카카오는 보안 강화 설정 시 필요

# Apple OAuth
export APPLE_CLIENT_ID="your-apple-service-id"
export APPLE_CLIENT_SECRET="your-generated-apple-secret"
```

### 2. 환경 변수 로드

```bash
source .env
```

### 3. 서버 실행

```bash
mix phx.server
```

이제 `http://localhost:4000/sign-in`으로 접속하면 소셜 로그인 화면을 볼 수 있습니다!

---

## 📱 카카오 로그인 설정

### 1. 카카오 개발자 계정 및 앱 생성

1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 저장

### 2. 앱 설정

#### 2.1 플랫폼 설정

- 내 애플리케이션 > 앱 설정 > 플랫폼
- Android/iOS 플랫폼 추가 (Flutter 앱용)
  - **Android**: 패키지명, 키 해시 입력
  - **iOS**: Bundle ID 입력

#### 2.2 Redirect URI 설정

- 내 애플리케이션 > 제품 설정 > 카카오 로그인
- Redirect URI 등록:
  ```
  http://localhost:4000/auth/user/kakao/callback  (개발용)
  https://yourdomain.com/auth/user/kakao/callback  (프로덕션)
  ```

#### 2.3 동의항목 설정

- 제품 설정 > 카카오 로그인 > 동의항목
- 필수 동의 항목:
  - 닉네임 (선택 동의로 설정 가능)
  - 프로필 사진 (선택)
  - **카카오계정(이메일)** ⭐ (필수 - 사용자 식별용)

### 3. 키 확인

- 내 애플리케이션 > 앱 설정 > 앱 키
- **REST API 키**를 복사하여 `KAKAO_CLIENT_ID`에 입력
- 보안 > 클라이언트 보안 강화를 활성화한 경우, **Client Secret**을 `KAKAO_CLIENT_SECRET`에 입력

### 4. Flutter 앱 설정 (딥링크)

Flutter 앱에서 카카오 로그인 후 앱으로 돌아오려면:

#### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />

  <!-- Kakao OAuth Callback -->
  <data
      android:scheme="kakaoYOUR_APP_KEY"
      android:host="oauth" />

  <!-- Your App Deep Link -->
  <data
      android:scheme="https"
      android:host="yourdomain.com"
      android:pathPrefix="/auth/user/kakao/callback" />
</intent-filter>
```

#### iOS (`ios/Runner/Info.plist`)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <!-- Kakao OAuth Callback -->
      <string>kakaoYOUR_APP_KEY</string>

      <!-- Your App Deep Link -->
      <string>https</string>
    </array>
  </dict>
</array>

<!-- LSApplicationQueriesSchemes for Kakao -->
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>kakaokompassauth</string>
  <string>kakaolink</string>
</array>
```

---

## 🍎 Apple 로그인 설정

### 1. Apple Developer 계정 요구사항

- Apple Developer Program 멤버십 필요 ($99/year)
- iOS 앱을 배포하려면 필수

### 2. Identifier 생성

1. [Apple Developer](https://developer.apple.com/) > Certificates, Identifiers & Profiles
2. Identifiers > "+" 버튼 클릭
3. **Services IDs** 선택 > Continue
4. Description, Identifier 입력 (예: `com.yourcompany.gongu.signin`)
5. **Sign In with Apple** 체크 > Configure 클릭
6. Primary App ID 선택
7. Website URLs:
   - Domains: `localhost:4000` (개발), `yourdomain.com` (프로덕션)
   - Return URLs:
     ```
     http://localhost:4000/auth/user/apple/callback
     https://yourdomain.com/auth/user/apple/callback
     ```

### 3. Key 생성 (Client Secret 생성용)

1. Keys > "+" 버튼
2. Key Name 입력 (예: "Gongu Sign In Key")
3. **Sign In with Apple** 체크 > Configure
4. Primary App ID 선택 > Save
5. Continue > Register
6. **Key ID**와 **.p8 파일**을 안전하게 보관 ⚠️ (한 번만 다운로드 가능)

### 4. Client Secret 생성

Apple은 Client Secret을 JWT로 직접 생성해야 합니다.

#### 필요한 정보:

- **Team ID**: Apple Developer > Membership에서 확인
- **Key ID**: 위에서 생성한 Key ID
- **Service ID**: 위에서 만든 Identifier (예: `com.yourcompany.gongu.signin`)
- **Private Key**: 다운로드한 `.p8` 파일

#### JWT 생성 스크립트 (Ruby)

```ruby
require 'jwt'

# 설정
team_id = 'YOUR_TEAM_ID'
client_id = 'com.yourcompany.gongu.signin'  # Service ID
key_id = 'YOUR_KEY_ID'
key_file = 'AuthKey_XXXXX.p8'  # 다운로드한 파일

# Private Key 읽기
ecdsa_key = OpenSSL::PKey::EC.new IO.read(key_file)

# JWT Claims
headers = {
  'kid' => key_id
}

claims = {
  'iss' => team_id,
  'iat' => Time.now.to_i,
  'exp' => Time.now.to_i + 86400 * 180,  # 6개월
  'aud' => 'https://appleid.apple.com',
  'sub' => client_id
}

# JWT 생성
token = JWT.encode claims, ecdsa_key, 'ES256', headers

puts token
```

실행:

```bash
gem install jwt
ruby generate_apple_secret.rb
```

생성된 토큰을 `APPLE_CLIENT_SECRET`에 입력합니다.

#### 또는 온라인 도구 사용:

- [jwt.io](https://jwt.io/)에서 수동 생성
- [Apple JWT Generator](https://github.com/okta/okta-signin-widget/tree/master/scripts) 같은 도구 사용

### 5. Flutter 앱 설정

#### iOS (`ios/Runner/Runner.entitlements`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.developer.applesignin</key>
  <array>
    <string>Default</string>
  </array>
</dict>
</plist>
```

#### Xcode 설정

1. Xcode에서 프로젝트 열기
2. Signing & Capabilities > "+ Capability"
3. **Sign in with Apple** 추가

---

## 🔧 프로덕션 배포 시 설정

### 환경 변수 설정 (`config/runtime.exs`)

```elixir
config :gongu, :kakao,
  client_id: System.get_env("KAKAO_CLIENT_ID"),
  client_secret: System.get_env("KAKAO_CLIENT_SECRET"),
  redirect_uri: "https://yourdomain.com/auth/user/kakao/callback"

config :gongu, :apple,
  client_id: System.get_env("APPLE_CLIENT_ID"),
  client_secret: System.get_env("APPLE_CLIENT_SECRET"),
  redirect_uri: "https://yourdomain.com/auth/user/apple/callback"
```

### Redirect URI 업데이트

- 카카오: Kakao Developers에서 프로덕션 URI 추가
- Apple: Apple Developer에서 프로덕션 도메인 추가

---

## 🧪 테스트

### 로컬 테스트

1. 서버 실행:

   ```bash
   mix phx.server
   ```

2. 브라우저에서 접속:

   ```
   http://localhost:4000/sign-in
   ```

3. 카카오 또는 Apple 버튼 클릭

4. 인증 성공 후 `/groups` 페이지로 리디렉션됨

### 확인사항

- ✅ 로그인 버튼 클릭 시 OAuth 페이지로 이동
- ✅ 인증 후 콜백 URL로 돌아옴
- ✅ 세션이 생성되고 `/groups` 페이지 접근 가능
- ✅ 로그아웃 버튼 동작 확인

---

## 🔍 트러블슈팅

### 카카오 로그인 오류

**"Redirect URI mismatch"**

- Kakao Developers에서 등록한 Redirect URI와 코드의 URI가 정확히 일치하는지 확인
- `http://` vs `https://` 차이 확인

**"동의 항목 미설정"**

- 카카오계정(이메일)이 필수 동의로 설정되었는지 확인

**"앱이 검수 중"**

- 개발 단계에서는 팀원만 로그인 가능
- 카카오 Developers > 앱 설정 > 팀원 관리에서 테스트 계정 추가

### Apple 로그인 오류

**"Invalid client"**

- Service ID가 정확한지 확인
- Client Secret JWT가 만료되지 않았는지 확인 (6개월 유효)

**"Redirect URI mismatch"**

- Apple Developer에서 등록한 Return URL과 정확히 일치하는지 확인

**"Private email relay"**

- Apple은 사용자 실제 이메일을 숨기고 Relay 이메일을 제공할 수 있음
- 이 경우 `privaterelay.appleid.com` 도메인의 이메일이 전달됨

---

## 📚 추가 리소스

- [Kakao 로그인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Apple Sign In 가이드](https://developer.apple.com/sign-in-with-apple/get-started/)
- [AshAuthentication OAuth2 문서](https://hexdocs.pm/ash_authentication/AshAuthentication.Strategy.OAuth2.html)
- [Flutter Deep Link 설정](https://docs.flutter.dev/development/ui/navigation/deep-linking)

---

## 💡 팁

1. **개발 중에는 카카오만 먼저 설정**하고, Apple은 앱 스토어 출시 전에 설정해도 됩니다.
2. Client Secret (특히 Apple .p8 파일)은 **절대 Git에 커밋하지 마세요**.
3. `.env` 파일을 `.gitignore`에 추가하세요.
4. 프로덕션에서는 환경 변수를 서버 환경 설정으로 관리하세요 (예: Fly.io secrets, AWS Parameter Store).
