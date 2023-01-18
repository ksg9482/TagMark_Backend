# TAG-MARK

## 기획
인터넷을 검색하다가 내용을 탭으로 열어서 보다 보면 탭이 어느샌가 수십개가 넘어가곤 합니다. 저도 그것은 마찬가지라 분명 찾아서 열었던 사이트를 다시 찾으려고 탭을 뒤적입니다. 그래서 탭을 좀 정리하려고 하면 나중에 보려고 북마크에 저장해 버립니다. 이것을 몇 번 반복하다 보면 북마크는 북마크대로 넘쳐나고 탭은 탭대로 가득 차는 결말을 맞습니다. 

심지어 북마크 내용이 일부는 중복되고 일부는 도대체 내가 이걸 왜 북마크 해놓았는지 모르게되는 경우도 있습니다. 그렇다면 차라리 북마크를 제대로 정리하자, 폴더로 정리하면 폴더만 우후죽순 늘어날거 같으니 태그로 관리할 수 있게 하자는 생각이 들었습니다. 그렇게 하여 북마크에 태크를 지정하고 태그 기반으로 북마크를 관리할 수 있는 사이트를 구상하게 되었습니다.

___

## 백엔드
* 태그 기반 검색을 위해 태그의 OR연산과 AND연산 구현
* 보안 및 로그인 유지를 위해 JWT(Json Web Token) 설정 
* Google 소셜 로그인 구현
* Swagger를 이용한 API 명세서 작성

### 기술 스택
* nestjs 
  * 이전부터 아키텍처에 관심이 많아 여러가지 아키텍처를 시도해 보았습니다. nodejs 진영 프레임워크에서는 nestjs가 아키텍처에 대한 기준을 가지고 있었고, nestjs가 제안하는 모듈기반 아키텍처를 경험해보고 싶었기 때문에 프레임워크로 nestjs를 선택했습니다.
* postgresql
  * mysql과 문법도 비슷해서 익히기 쉬웠고, 최근 트렌드를 따라간 면도 있었습니다. 하지만 가장 큰 이유는 
* nginx
  * WS와 WAS 분리를 해야 더 안전하고 서버의 부담을 덜 수 있다는 것은 알고 있었지만 실제로 적용하지는 않았습니다. 실제로 적용해보려고 도입하였고, 아파치도 선택지에 있었지만 nginx가 성능이 좋고 가볍기 때문에 nodejs와 궁합이 좋아 nginx를 선택했습니다.
* docker
  * 개발을 데스크탑과 노트북을 병행하기 때문에 개발환경이 서로 다릅니다. 그렇기에 같은 개발환경을 만들기 위해 도커를 이용했고, 어차피 배포할 때도 개발환경이 달라지기 때문에 환경설정과 관리를 쉽게 하기 위해 이용했습니다.
* ec2
  * 헤로쿠를 이용하여 배포하려 했다가 무료 postgresql이 중단된다는 알림을 보았습니다. 이렇게 된거 환경설정부터 배포까지 다시 복습해보자는 생각에 ec2를 이용했습니다.

___

## 데이터베이스 테이블 구조
![tagmark_entities](https://user-images.githubusercontent.com/83062886/212309957-a1f19308-559a-4a0c-a626-40929ee2bd58.jpg)
___

## API 명세
[swagger](http://ec2-52-91-45-225.compute-1.amazonaws.com/api-docs)


## 디렉토리 구성
* Core
  * 핵심부입니다. 추상클래스와 엔티티가 존재하고 Core는 프레임워크와 분리되어 있어서 프레임워크가 바뀌어도 수정할 부분이 적게 했습니다.
* Controllers
  * HTTP 요청을 해당 비즈니스 로직과 매칭하는 부분입니다. DTO를 이용하기에 Controllers에 DTO 디렉토리가 존재하며, 비즈니스 로직에 맞게 데이터 형식을 가공하여 use-case를 호출합니다.
* Frameworks
  * 엔티티를 기반으로 한 DB 테이블 모델이 존재하고, 데이터베이스 프레임워크를 통해 데이터베이스에 쿼리를 전송한다.
* Services
  * 데이터베이스와의 연결을 서비스로서 제공합니다.
* Use-cases
  * 설계한 비즈니스 로직으로 요청받은 데이터를 처리하여 처리가 완료된 데이터를 반환합니다.
* Utils
  * JWT, Logger 등 유틸리티를 관리합니다.
* auth
  * 요청에 JWT의 존재 여부와 정합성을 확인하고, 요청한 유저ID를 요청에 삽입하여 @AuthUser 데코레이터를 사용할 수 있게 합니다.
___

## 미리보기
___

#### 후기
이 프로젝트는 실제로 제가 사용할 사이트이기 때문에 장기적인 리펙토링, 학습한 내용의 지속적인 적용을 염두에 두었습니다. 객체지향 패러다임과 함수형 패러다임 모두에 관심이 있기 때문에 백엔드에서는 NestJS를 통해 객체지향을 적용하고, 프론트엔드에서는 함수형 패러다임 적용하여 발전시키려고 합니다.

새로운 기능을 추가하고 코드를 탄탄하게 만들어 Ver.2를 개발하는 것이 이후의 목표입니다.

