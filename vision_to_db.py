import cv2
import time
import base64
from ultralytics import YOLO
from supabase import create_client, Client

# 1. 정보 유지
url = "https://jhduyrvvnjxxrwexdquw.supabase.co"
key = "sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr"
supabase: Client = create_client(url, key)

model = YOLO("best (1).pt") 
cap = cv2.VideoCapture(0)

# --- 치밀한 상태 관리 설정 ---
is_logged = False
missing_counter = 0
detection_counter = 0

CONFIDENCE_LEVEL = 0.88    # 88%로 하향 (유연한 인식)
CONFIRM_THRESHOLD = 10     # 10번 연속 감지되어야 진짜 입고 (지갑 방어)
MISSING_LIMIT = 30         # 30번 연속 안 보여야 삭제 (가림 방지)

print(f"🌿 [감시 모드] {int(CONFIDENCE_LEVEL*100)}% 신뢰도로 탐지 중...")

while cap.isOpened():
    success, frame = cap.read()
    if not success: break

    # 88% 확률로 탐지
    results = model(frame, conf=CONFIDENCE_LEVEL, verbose=False)
    detected_now = len(results[0].boxes) > 0

    if detected_now:
        missing_counter = 0
        detection_counter += 1
        
        # 확실히 보일 때(10프레임 이상)만 사진 찍어서 전송
        if detection_counter >= CONFIRM_THRESHOLD and not is_logged:
            # 실시간 캡처 및 Base64 변환
            box = results[0].boxes[0].xyxy[0].cpu().numpy().astype(int)
            crop = frame[box[1]:box[3], box[0]:box[2]] 
            
            if crop.size > 0:
                h, w = crop.shape[:2]
                resized = cv2.resize(crop, (300, int(h * (300 / w))))
                _, buffer = cv2.imencode('.jpg', resized)
                img_text = base64.b64encode(buffer).decode('utf-8')
                image_payload = f"data:image/jpeg;base64,{img_text}"
            else:
                image_payload = None

            data = {
                "label": "바나나",
                "percentage": 95, 
                "status": "Fresh",
                "image_data": image_payload
            }
            try:
                supabase.table("freshness_data").insert(data).execute()
                print("🚀 [입고] 88% 신뢰도로 사진 전송 완료")
                is_logged = True
            except Exception as e:
                print(f"❌ 전송 실패: {e}")
    else:
        detection_counter = 0
        if is_logged:
            missing_counter += 1
            if missing_counter >= MISSING_LIMIT:
                try:
                    supabase.table("freshness_data").delete().eq("label", "바나나").execute()
                    print("🧹 [퇴고] 재고 삭제 완료")
                    is_logged = False
                    missing_counter = 0
                except Exception as e:
                    print(f"❌ 삭제 실패: {e}")

    cv2.imshow("Smart Monitor", results[0].plot())
    if cv2.waitKey(1) & 0xFF == ord("q"): break

cap.release()
cv2.destroyAllWindows()