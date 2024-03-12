# TAG-MARK

## 기획

인터넷을 검색하다가 내용을 탭으로 열어서 보다 보면 탭이 어느샌가 수십개가 넘어가곤 합니다. 그래서 탭을 좀 정리하려고 북마크를 써도 북마크는 북마크대로 어지럽고 탭은 탭대로 가득 차는 결말을 맞습니다.

차라리 폴더 단위로 구분하는 것이 아니라 북마크에 태크를 지정하고 태그 기반으로 북마크를 관리할 수 있는 어플리케이션을 구상하게 되었고, 태그를 기반으로 북마크를 분류하기 때문에 TAG-MARK라는 이름을 붙였습니다.

## TAG-MARK 상세

TAG-MARK는 태그를 기반으로 북마크를 '구분'하는데 초점을 맞추었습니다. 구분한 태그를 기준으로 AND/OR 검색을 통해 원하는 태그가 부여된 북마크만 나열할 수 있습니다.

### TAG-MARK 기술 스택

- Server: NodeJS, NestJS
- DataBase: PostgreSQL, TypeORM
- Util: Winston, JWT
- Test: Jest

## TAG-MARK 개발환경

- Ubuntu - 20.04
- node - 16.13.0
- npm - 8.1.0

## API 명세

### Common API

- 서버 연결 확인 {get} /

### Bookmark API

- 북마크 생성 {POST} /api/bookmarks
- 북마크 동기화 {POST} /api/bookmarks/sync
- 북마크 수정 {PATCH} /api/bookmarks/{id}
- 작성한 북마크 가져오기 {GET} /api/bookmarks
- 북마크 갯수 확인 {GET} /api/bookmarks/count
- 북마크 삭제 {DELETE} /api/bookmarks/{id}
- 북마크 태그 AND 검색 {GET} /api/bookmarks/search-and
- 북마크 태그 OR 검색 {GET} /api/bookmarks/search-or

### Tag API

- 태그 생성 {POST} /api/tags
- 태그 확인 {GET} /api/tags
- 태그 갯수 확인 {GET} /api/tags/count
- 태그 삭제 {DELETE} /api/tags/{bookmark_id}

### User API

- 회원가입 {POST} /api/users
- 로그인 {POST} /api/users/login
- 구글 소셜 로그인 {POST} /api/usesr/google
- 비밀번호 확인 {POST} /api/users/valid
- 유저 정보 확인 {GET} /api/users
- 유저 정보 수정 {PATCH} /api/users
- 새 액세스 토큰 발급 {GET} /api/users/refresh
- 로그아웃 {GET} /api/usesr/logout
- 회원 탈퇴 {DELETE} /api/users
