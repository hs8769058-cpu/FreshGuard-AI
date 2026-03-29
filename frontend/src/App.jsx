import React, { useState, useEffect } from 'react';
import { Bell, TriangleAlert, Thermometer, Droplets, Wind, Home, History, Settings, CheckCircle } from 'lucide-react';

function App() {
  const [isAlert, setIsAlert] = useState(false);
  const [fruitData, setFruitData] = useState({ temp: 24.5, humidity: 65, ethylene: "Safe" });

  // 1. 앱 켜지자마자 알림 권한 물어보기
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // 2. 푸시 알림 쏘는 함수 (진짜 폰 상단에 뜸!)
  const sendPush = (msg) => {
    if (Notification.permission === "granted") {
      new Notification("FreshGuard AI 경고", {
        body: msg,
        icon: "https://cdn-icons-png.flaticon.com/512/415/415733.png"
      });
    }
  };

  // 3. 파이썬(YOLO/센서) 서버와 통신하는 핵심 로직
  useEffect(() => {
    const checkAIStatus = setInterval(() => {
      // 나중에 만들 app.py 주소입니다.
      fetch('http://localhost:8000/status')
        .then(res => res.json())
        .then(data => {
          // AI가 "danger"라고 판단하면 화면을 바꾸고 푸시를 쏩니다.
          if (data.status === 'danger' && !isAlert) {
            setIsAlert(true);
            sendPush(data.message);
          } else if (data.status === 'safe') {
            setIsAlert(false);
          }
        })
        .catch(err => console.log("서버가 아직 꺼져있어요!"));
    }, 3000); // 3초마다 체크

    return () => clearInterval(checkAIStatus);
  }, [isAlert]);

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'sans-serif' }}>
      
      {/* 상단바 (테스트용 클릭 기능 유지) */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>FreshGuard <span style={{ color: '#22c55e' }}>AI</span></h1>
        <div onClick={() => { setIsAlert(!isAlert); if(!isAlert) sendPush("바나나 부패 위험!"); }} style={{ cursor: 'pointer' }}>
          <Bell size={24} color={isAlert ? "#ef4444" : "#64748b"} />
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        {/* 상태 카드 */}
        <div style={{ backgroundColor: isAlert ? '#fff1f2' : '#f0fdf4', padding: '24px', borderRadius: '28px', marginBottom: '25px', border: `1px solid ${isAlert ? '#fecdd3' : '#dcfce7'}`, transition: '0.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ backgroundColor: isAlert ? '#fb7185' : '#22c55e', padding: '8px', borderRadius: '12px' }}>
              {isAlert ? <TriangleAlert size={20} color="white" /> : <CheckCircle size={20} color="white" />}
            </div>
            <span style={{ fontWeight: '700', color: isAlert ? '#e11d48' : '#15803d', fontSize: '18px' }}>
              보관함: {isAlert ? '부패 위험' : '매우 신선'}
            </span>
          </div>
          <p style={{ margin: 0, color: isAlert ? '#4c0519' : '#064e3b' }}>
            {isAlert ? "AI가 부패를 감지했습니다! 즉시 확인하세요." : "AI 분석 결과: 신선도가 잘 유지되고 있습니다."}
          </p>
        </div>

        {/* 센서 데이터 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '25px' }}>
          <SensorCard icon={<Thermometer size={16} />} label="온도" value={fruitData.temp + "°C"} color="#3b82f6" />
          <SensorCard icon={<Droplets size={16} />} label="습도" value={fruitData.humidity + "%"} color="#06b6d4" />
          <SensorCard icon={<Wind size={16} />} label="에틸렌" value={isAlert ? "High" : "Safe"} color={isAlert ? "#e11d48" : "#22c55e"} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>보관함 내부 과일</h3>
        <FruitItem name="바나나" count="3개" status={isAlert ? "부패위험" : "신선"} statusColor={isAlert ? "#ef4444" : "#22c55e"} />
      </main>

      {/* 하단 탭 바 */}
      <nav style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '450px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', padding: '12px 0' }}>
        <NavItem icon={<Home size={22} />} label="홈" active />
        <NavItem icon={<History size={22} />} label="로그" />
        <NavItem icon={<Settings size={22} />} label="설정" />
      </nav>
    </div>
  );
}

// (컴포넌트 함수들은 이전과 동일하므로 생략 - 그대로 유지해 주세요!)
function SensorCard({ icon, label, value, color }) { return (<div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '16px', textAlign: 'center', border: '1px solid #f1f5f9' }}><div style={{ color: color, display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>{icon}</div><div style={{ fontSize: '11px', color: '#94a3b8' }}>{label}</div><div style={{ fontSize: '14px', fontWeight: '700' }}>{value}</div></div>); }
function FruitItem({ name, count, status, statusColor }) { return (<div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><span>{name === '바나나' ? '🍌' : '🍎'}</span><div><div style={{ fontWeight: '700' }}>{name} ({count})</div></div></div><div style={{ color: statusColor, fontWeight: '800' }}>{status}</div></div>); }
function NavItem({ icon, label, active }) { return (<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: active ? '#22c55e' : '#94a3b8' }}>{icon}<span style={{ fontSize: '11px' }}>{label}</span></div>); }

export default App;