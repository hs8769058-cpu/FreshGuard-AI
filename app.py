import streamlit as st

st.set_page_config(page_title="FreshGuard AI", page_icon="🍎", layout="centered")

st.markdown("""
    <style>
        .stApp { background-color: #F2F2F7; }
        #MainMenu {visibility: hidden;}
        header {visibility: hidden;}
        .app-card { background-color: white; padding: 20px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin-bottom: 20px; }
        .title-text { text-align: center; color: #1C1C1E; font-weight: 800; font-size: 24px; margin-bottom: 10px; }
        .subtitle-text { text-align: center; color: #8E8E93; font-size: 14px; margin-bottom: 20px; }
    </style>
""", unsafe_allow_html=True)

st.markdown("<div class='title-text'>🍎 스마트 보관함 AI</div>", unsafe_allow_html=True)
st.markdown("<div class='subtitle-text'>실시간 부패 예측 및 에틸렌 모니터링 시스템</div>", unsafe_allow_html=True)

tab_home, tab_chart, tab_setting = st.tabs(["🏠 홈 (요약)", "📊 실시간 데이터", "⚙️ 실험 설정"])

with tab_home:
    st.markdown("""
        <div class='app-card'>
            <h3 style='margin-top:0;'>📷 AI 비전 분석</h3>
            <div style='background-color: #E5E5EA; height: 200px; border-radius: 10px; display: flex; align-items: center; justify-content: center;'><b>(카메라 화면 예정)</b></div>
        </div>
        <div class='app-card'>
            <h3 style='margin-top:0;'>🚨 현재 부패 위험도</h3>
            <h2 style='color: #00B74A; text-align: center;'>✅ 안전 (Safe)</h2>
        </div>
    """, unsafe_allow_html=True)

with tab_chart:
    st.markdown("<div class='app-card'><h3>💨 에틸렌(C2H4) 추이</h3><p>최근 2시간 평균 보정 데이터 (차트 예정)</p></div>", unsafe_allow_html=True)

with tab_setting:
    st.markdown("<div class='app-card'>", unsafe_allow_html=True)
    st.subheader("🧪 실험 시나리오")
    scenario = st.radio("측정 과일 선택", ["🍌 바나나 단독", "🍎 사과 단독", "🔄 혼합"])
    st.markdown("</div>", unsafe_allow_html=True)