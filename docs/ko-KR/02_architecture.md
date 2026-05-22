# mAI 아키텍처 🏗️

**mAI** 애플리케이션은 성능, 확장성 및 유지 관리 편의성을 고려하여 설계된 현대적인 아키텍처를 기반으로 구축되었습니다. 이 프로젝트는 모노레포(Monorepo) 구조로 구성되어 있습니다.

## 핵심 기술

- **핵심 프레임워크**: 렌더링 및 라우팅을 위한 Next.js (App Router 사용).
- **상태 관리**: 가볍고 반응성이 뛰어난 클라이언트 측 상태 제어를 위한 Zustand.
- **디자인 및 UI**: `antd-style` 및 `@lobehub/ui`로 스타일링된 Ant Design 컴포넌트.
- **데이터베이스**: Drizzle ORM으로 관리되는 로컬 SQLite (또는 프로덕션 환경의 PostgreSQL).

## 모노레포 구조

코드베이스는 `packages/` 디렉터리 아래의 재사용 가능한 패키지들로 나뉩니다.
- `packages/const`: 전역 상수 및 설정.
- `packages/builtin-agents`: 기본 시스템 에이전트(May 포함).
- `packages/database`: 데이터 모델, Drizzle 스키마 및 마이그레이션.
- `packages/types`: 공유 TypeScript 타입 정의.

이러한 분리를 통해 모델 API 요청 실행이나 플러그인 관리와 같은 핵심 비즈니스 로직을 `src/`에 위치한 메인 웹 사용자 인터페이스로부터 격리합니다.
