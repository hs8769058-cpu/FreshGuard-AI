import streamlit as st

# --- 1. 앱 기본 설정 (화면 중앙 정렬로 폰 앱 느낌 강조) ---
st.set_page_config(page_title="FreshGuard AI", page_icon="🍎", layout="centered")

# --- 2. 진짜 앱처럼 보이게 만드는 마법의 커스텀 CSS ---
st.markdown("""
    <style>
        /* 기본 배경색을 약간 회색으로 (아이폰 기본 배경 느낌) */
        .stApp {
            background-color: #F2F2F7;
        }
        /* 우측 상단의 Streamlit 기본 메뉴 숨기기 (깔끔하게) */
        #MainMenu {visibility: hidden;}
        header {visibility: hidden;}
        
        /* 모바일 앱 스타일의 둥근 하얀색 카드 디자인 */
        .app-card {
            background-color: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
        }
        
        /* 글자 색상 세팅 */
        .title-text { text-align: center; color: #1C1C1E; font-weight: 800; font-size: 24px; margin-bottom: 10px; }
        .subtitle-text { text-align: center; color: #8E8E93; font-size: 14px; margin-bottom: 20px; }
    </style>
""", unsafe_allow_html=True)

# --- 3. 앱 상단 타이틀 ---
st.markdown("<div class='title-text'>🍎 스마트 보관함 AI</div>", unsafe_allow_html=True)
st.markdown("<div class='subtitle-text'>실시간 부패 예측 및 에틸렌 모니터링 시스템</div>", unsafe_allow_html=True)

# --- 4. 앱 하단 네비게이션 바(메뉴) 역할을 할 탭 기능 ---
# 교수님들이 가장 직관적으로 누르기 편하게 3개의 화면으로 나눕니다.
tab_home, tab_chart, tab_setting = st.tabs(["🏠 홈 (요약)", "📊 실시간 데이터", "⚙️ 실험 설정"])

# --- [화면 1] 홈 탭: YOLO 사진과 현재 위험도 요약 ---
with tab_home:
    st.markdown("""
        <div class='app-card'>
            <h3 style='margin-top:0;'>📷 AI 비전 분석</h3>
            <p style='color: gray; font-size: 14px;'>YOLOv8 모델 실시간 판독 화면 (사과 & 바나나)</p>
            <div style='background-color: #E5E5EA; height: 200px; border-radius: 10px; display: flex; align-items: center; justify-content: center;'>
                <b>(추후 여기에 카메라 실시간 사진이 들어갑니다)</b>
            </div>
        </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
        <div class='app-card'>
            <h3 style='margin-top:0;'>🚨 현재 부패 위험도</h3>
            <h2 style='color: #00B74A; text-align: center;'>✅ 안전 (Safe)</h2>
            <p style='text-align: center; color: gray;'>에틸렌 가스 농도가 정상 범위 내에 있습니다.</p>
        </div>
    """, unsafe_allow_html=True)

# --- [화면 2] 차트 탭: 2시간 평균 에틸렌 가스 그래프 ---
with tab_chart:
    st.markdown("""
        <div class='app-card'>
            <h3 style='margin-top:0;'>💨 에틸렌(C2H4) 추이</h3>
            <p style='color: gray; font-size: 14px;'>최근 2시간 평균 보정 데이터</p>
            <div style='background-color: #E5E5EA; height: 250px; border-radius: 10px; display: flex; align-items: center; justify-content: center;'>
                <b>(추후 여기에 꺾은선 그래프가 들어갑니다)</b>
            </div>
        </div>
    """, unsafe_allow_html=True)

# --- [화면 3] 설정 탭: 바나나/사과/혼합 모드 선택 ---
with tab_setting:
    st.markdown("<div class='app-card'>", unsafe_allow_html=True)
    st.subheader("🧪 현재 실험 시나리오")
    
    # 향후 이 버튼 값에 따라 2시간 평균 임계값(위험 기준치)이 달라지는 로직을 짤 겁니다.
    scenario = st.radio(
        "측정 중인 과일을 선택하세요",
        ["🍌 바나나 단독", "🍎 사과 단독", "🔄 바나나 & 사과 혼합"]
    )
    st.markdown("</div>", unsafe_allow_html=True)