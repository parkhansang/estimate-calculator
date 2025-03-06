// ===== 공통 설정 및 유틸리티 함수 =====
// 기본 가격 설정
const defaultPrices = {
    wallpaper: {
        small: 3500,   // 소폭
        wide: 4700,    // 장폭
        silk: 8000     // 실크
    },
    labor: {
        fullDay: 240000,  // 1품
        halfDay: 170000   // 반품
    },
    material: {
        paper: 650,    // 합지 부자재
        silk: 3900     // 실크 부자재
    },
    flooring: {
        "1.8": 38000,  // KCC 1.8t
        "2.0": 48000,  // KCC 2.0t
        "2.2": 58000,  // KCC 2.2t
        "2.7": 82000,  // KCC 2.7t
        "3.2": 95000,  // KCC 3.2t
        "4.5": 99000,  // KCC 4.5t
        "5.0": 110000  // KCC 5.0t
    }
};

// 벽지 소요량 정의
const wallpaperRequirements = {
    "13": { living: 15, room: 20 },
    "15": { living: 15, room: 25 },
    "18": { living: 20, room: 25 },
    "19": { living: 20, room: 30 },
    "22": { living: 25, room: 30 },
    "24": { living: 30, room: 35 },
    "25": { living: 25, room: 40 },
    "28": { living: 30, room: 40 },
    "32": { living: 35, room: 45 },
    "34": { living: 35, room: 50 },
    "38": { living: 40, room: 55 },
    "42": { living: 45, room: 60 },
    "45": { living: 45, room: 70 },
    "50": { living: 50, room: 75 },
    "55": { living: 55, room: 85 },
    "60": { living: 60, room: 90 },
    "65": { living: 65, room: 100 },
    "70": { living: 70, room: 105 }
};

// 평형별 전용면적 정의
const flooringAreas = {
    "13": 10,
    "15": 11,
    "18": 13.5,
    "19": 14,
    "22": 16.5,
    "24": 18,
    "25": 18.5,
    "28": 21,
    "32": 24,
    "34": 25.5,
    "38": 28.5,
    "42": 31.5,
    "45": 33.5,
    "50": 37.5,
    "55": 41,
    "60": 45,
    "65": 48.5,
    "70": 52.5
};

// localStorage 키 정의
const STORAGE_KEYS = {
    CUSTOM_SETTINGS: 'wallpaperFlooringCustomSettings',
    ESTIMATE_DATA: 'wallpaperFlooringEstimateData'
};

// ===== 견적 계산 기능 =====
// 인건비 계산 로직 (32평 인건비만 수정)
function calculateLaborCost(houseSize, livingType, roomType) {
    if (!houseSize || !livingType || !roomType) return 0;
    
    // livingType, roomType이 1 또는 2면 합지, 3이면 실크
    const isLivingPaper = livingType < 3;
    const isRoomPaper = roomType < 3;
    
    // 방=합지시공, 거실=합지시공
    if (isRoomPaper && isLivingPaper) {
        const laborData = {
            "13": [1, 0],
            "15": [1, 0],
            "18": [1, 0],
            "19": [1, 1],
            "22": [2, 0],
            "24": [2, 0],
            "25": [2, 0],
            "28": [2, 0],
            "32": [3, 0], // 32평 인건비를 3품으로 변경
            "34": [3, 0],
            "38": [3, 0],
            "42": [3, 1],
            "45": [4, 0],
            "50": [4, 0],
            "55": [5, 0],
            "60": [5, 0],
            "65": [6, 0],
            "70": [6, 0]
        };
        
        if (laborData[houseSize]) {
            return currentPrices.labor.fullDay * laborData[houseSize][0] + 
                    currentPrices.labor.halfDay * laborData[houseSize][1];
        }
    }
    
    // 방=실크시공, 거실=합지시공 또는 방=합지시공, 거실=실크시공
    if ((isRoomPaper && !isLivingPaper) || (!isRoomPaper && isLivingPaper)) {
        const laborData = {
            "13": [2, 0],
            "15": [2, 0],
            "18": [2, 0],
            "19": [2, 0],
            "22": [2, 1],
            "24": [2, 1],
            "25": [3, 0],
            "28": [3, 1],
            "32": [3, 1],
            "34": [4, 0],
            "38": [4, 1],
            "42": [5, 0],
            "45": [5, 1],
            "50": [6, 0],
            "55": [6, 1],
            "60": [7, 0],
            "65": [8, 0],
            "70": [8, 0]
        };
        
        if (laborData[houseSize]) {
            return currentPrices.labor.fullDay * laborData[houseSize][0] + 
                    currentPrices.labor.halfDay * laborData[houseSize][1];
        }
    }
    
    // 방=실크시공, 거실=실크시공
    if (!isRoomPaper && !isLivingPaper) {
        // 일반 실크 시공
        if (roomType === "3" && livingType === "3") {
            const laborData = {
                "13": [2, 0],
                "15": [2, 0],
                "18": [2, 1],
                "19": [2, 1],
                "22": [3, 0],
                "24": [3, 0],
                "25": [3, 0],
                "28": [4, 0],
                "32": [4, 0],
                "34": [4, 1],
                "38": [5, 0],
                "42": [6, 1],
                "45": [7, 0],
                "50": [8, 0],
                "55": [9, 0],
                "60": [10, 0],
                "65": [10, 0],
                "70": [11, 0]
            };
            
            if (laborData[houseSize]) {
                return currentPrices.labor.fullDay * laborData[houseSize][0] + 
                    currentPrices.labor.halfDay * laborData[houseSize][1];
            }
        }
    }
    
    return 0;
}

// 부자재 비용 계산
function calculateMaterialCost(houseSize, livingType, roomType) {
    if (!houseSize || !livingType || !roomType) return 0;
    
    const livingArea = wallpaperRequirements[houseSize]?.living || 0;
    const roomArea = wallpaperRequirements[houseSize]?.room || 0;
    
    // 합지 또는 실크 여부
    const isLivingPaper = livingType < 3;
    const isRoomPaper = roomType < 3;
    
    const livingMaterialPrice = isLivingPaper ? currentPrices.material.paper : currentPrices.material.silk;
    const roomMaterialPrice = isRoomPaper ? currentPrices.material.paper : currentPrices.material.silk;
    
    return (livingArea * livingMaterialPrice) + (roomArea * roomMaterialPrice);
}

// 벽지 가격 계산
function calculateWallpaperPrice(houseSize, livingType, roomType) {
    if (!houseSize || !livingType || !roomType) return 0;
    
    const livingArea = wallpaperRequirements[houseSize]?.living || 0;
    const roomArea = wallpaperRequirements[houseSize]?.room || 0;
    
    let livingPrice = 0;
    let roomPrice = 0;
    
    // 거실 벽지 가격
    if (livingType === "1") livingPrice = currentPrices.wallpaper.small;
    else if (livingType === "2") livingPrice = currentPrices.wallpaper.wide;
    else if (livingType === "3") livingPrice = currentPrices.wallpaper.silk;
    
    // 방 벽지 가격
    if (roomType === "1") roomPrice = currentPrices.wallpaper.small;
    else if (roomType === "2") roomPrice = currentPrices.wallpaper.wide;
    else if (roomType === "3") roomPrice = currentPrices.wallpaper.silk;
    
    return (livingArea * livingPrice) + (roomArea * roomPrice);
}

// 장판 가격 계산
function calculateFlooringPrice(houseSize, flooringType) {
    if (!houseSize || !flooringType) return 0;
    
    const area = flooringAreas[houseSize] || 0;
    const price = currentPrices.flooring[flooringType] || 0;
    
    return area * price;
}

// ===== 견적 프로그램 기능 =====
// 사용할 가격 설정 (기본값 또는 맞춤설정)
let currentPrices = JSON.parse(JSON.stringify(defaultPrices));

// 맞춤설정 저장 목록
let customSettings = [];

// 사용자 입력값 가져오기
function getInputValues() {
    if (document.getElementById("houseSize")) {
        const houseSize = document.getElementById("houseSize").value;
        const livingWallpaper = document.getElementById("livingWallpaper").value;
        const roomWallpaper = document.getElementById("roomWallpaper").value;
        const extraCost = parseInt(document.getElementById("extraCost").value || 0);
        const flooringType = document.getElementById("flooringType").value;
        
        return { houseSize, livingWallpaper, roomWallpaper, extraCost, flooringType };
    }
    return null;
}

// 결과 업데이트
function updateResults() {
    console.log("결과 업데이트 함수 호출됨");
    const values = getInputValues();
    if (!values) return;
    
    const { houseSize, livingWallpaper, roomWallpaper, extraCost, flooringType } = values;
    
    // 벽지 면적 표시
    document.getElementById("livingArea").textContent = `거실 벽지 면적: ${wallpaperRequirements[houseSize]?.living || 0}평`;
    document.getElementById("roomArea").textContent = `방 벽지 면적: ${wallpaperRequirements[houseSize]?.room || 0}평`;
    
    // 장판 면적 표시
    document.getElementById("flooringArea").textContent = `장판 면적: ${flooringAreas[houseSize] || 0}평`;
    
    // 벽지 가격
    const wallpaperPrice = calculateWallpaperPrice(houseSize, livingWallpaper, roomWallpaper);
    document.getElementById("wallpaperPrice").textContent = `${wallpaperPrice.toLocaleString()}원`;
    
    // 인건비
    const laborCost = calculateLaborCost(houseSize, livingWallpaper, roomWallpaper);
    document.getElementById("laborCost").textContent = `${laborCost.toLocaleString()}원`;
    
    // 부자재
    const materialCost = calculateMaterialCost(houseSize, livingWallpaper, roomWallpaper);
    document.getElementById("materialCost").textContent = `${materialCost.toLocaleString()}원`;

    // 장판 가격
    const flooringPrice = calculateFlooringPrice(houseSize, flooringType);
    document.getElementById("flooringPrice").textContent = `장판 가격: ${flooringPrice.toLocaleString()}원`;

    // 총 도배 가격 (벽지 가격 + 인건비 + 부자재 + 기타비용)
    const totalWallpaper = wallpaperPrice + laborCost + materialCost + extraCost;
    document.getElementById("totalWallpaper").textContent = totalWallpaper.toLocaleString();

    // 총 장판 가격
    document.getElementById("totalFlooring").textContent = flooringPrice.toLocaleString();

    // 총합계 (도배 + 장판)
    const grandTotal = totalWallpaper + flooringPrice;
    document.getElementById("grandTotal").textContent = grandTotal.toLocaleString();
}

// 견적서 페이지로 이동 (데이터 저장 포함)
function goToQuote() {
    const values = getInputValues();
    if (!values) return;
    
    const { houseSize, livingWallpaper, roomWallpaper, extraCost, flooringType } = values;
    
    // 벽지 가격
    const wallpaperPrice = calculateWallpaperPrice(houseSize, livingWallpaper, roomWallpaper);
    // 인건비
    const laborCost = calculateLaborCost(houseSize, livingWallpaper, roomWallpaper);
    // 부자재
    const materialCost = calculateMaterialCost(houseSize, livingWallpaper, roomWallpaper);
    // 장판 가격
    const flooringPrice = calculateFlooringPrice(houseSize, flooringType);
    // 총 도배 가격
    const totalWallpaper = wallpaperPrice + laborCost + materialCost + extraCost;
    // 총합계
    const grandTotal = totalWallpaper + flooringPrice;
    
    // 견적 데이터 생성
    const estimateData = {
        houseSize,
        livingWallpaper,
        roomWallpaper,
        flooringType,
        extraCost,
        wallpaperPrice,
        laborCost,
        materialCost,
        flooringPrice,
        totalWallpaper,
        grandTotal,
        createdAt: new Date().toISOString()
    };
    
    // 견적 데이터 localStorage에 저장
    localStorage.setItem(STORAGE_KEYS.ESTIMATE_DATA, JSON.stringify(estimateData));
    
    // 견적서 페이지로 이동 (from=estimate 파라미터 추가하여 업체 선택 팝업 표시)
    window.location.href = 'pdf-quote.html?from=estimate';
}

// ===== 맞춤설정 관리 기능 =====
// 모달 열기
function openModal() {
    document.getElementById("customModal").style.display = "block";
}

// 모달 닫기
function closeModal() {
    document.getElementById("customModal").style.display = "none";
}

// 맞춤설정 수정
function editCustomSetting() {
    const selectedValue = document.getElementById("customSetting").value;
    
    // 기본값은 수정할 수 없음
    if (selectedValue === "default") {
        alert("기본값은 수정할 수 없습니다.");
        return;
    }
    
    const index = parseInt(selectedValue);
    if (!isNaN(index) && customSettings[index]) {
        // 선택된 설정 불러오기
        const setting = customSettings[index];
        
        // 모달 폼에 현재 설정값 채우기
        document.getElementById("settingName").value = setting.name;
        
        // 벽지 단가 설정
        document.getElementById("customSmallPrice").value = setting.prices.wallpaper.small;
        document.getElementById("customWidePrice").value = setting.prices.wallpaper.wide;
        document.getElementById("customSilkPrice").value = setting.prices.wallpaper.silk;
        
        // 인건비 설정
        document.getElementById("customFullDayCost").value = setting.prices.labor.fullDay;
        document.getElementById("customHalfDayCost").value = setting.prices.labor.halfDay;
        
        // 부자재 설정
        document.getElementById("customPaperMaterial").value = setting.prices.material.paper;
        document.getElementById("customSilkMaterial").value = setting.prices.material.silk;
        
        // 장판 단가 설정
        document.getElementById("custom18t").value = setting.prices.flooring["1.8"];
        document.getElementById("custom20t").value = setting.prices.flooring["2.0"];
        document.getElementById("custom22t").value = setting.prices.flooring["2.2"];
        document.getElementById("custom27t").value = setting.prices.flooring["2.7"];
        document.getElementById("custom32t").value = setting.prices.flooring["3.2"];
        document.getElementById("custom45t").value = setting.prices.flooring["4.5"];
        document.getElementById("custom50t").value = setting.prices.flooring["5.0"];
        
        // 모달 열기
        openModal();
    }
}

// 맞춤설정 삭제
function deleteCustomSetting() {
    const selectedValue = document.getElementById("customSetting").value;
    
    // 기본값은 삭제할 수 없음
    if (selectedValue === "default") {
        alert("기본값은 삭제할 수 없습니다.");
        return;
    }
    
    const index = parseInt(selectedValue);
    if (!isNaN(index) && customSettings[index]) {
        const settingName = customSettings[index].name;
        
        // 삭제 확인
        if (confirm(`'${settingName}' 설정을 삭제하시겠습니까?`)) {
            // 배열에서 설정 제거
            customSettings.splice(index, 1);
            
            // 로컬 스토리지 업데이트
            localStorage.setItem(STORAGE_KEYS.CUSTOM_SETTINGS, JSON.stringify(customSettings));
            
            // 드롭다운 업데이트
            updateCustomSettingsDropdown();
            
            // 기본값으로 변경
            document.getElementById("customSetting").value = "default";
            applyCustomSetting();
            
            alert(`'${settingName}' 설정이 삭제되었습니다.`);
        }
    }
}

// 맞춤설정 저장
function saveCustomSetting() {
    const name = document.getElementById("settingName").value.trim();
    if (!name) {
        alert("맞춤설정 이름을 입력해주세요.");
        return;
    }
    
    // 같은 이름의 설정이 있는지 확인
    const existingIndex = customSettings.findIndex(s => s.name === name);
    if (existingIndex !== -1) {
        // 확인 메시지 표시
        if (!confirm(`'${name}' 설정이 이미 존재합니다. 덮어쓰시겠습니까?`)) {
            return; // 취소 선택 시 함수 종료
        }
        // 여기까지 코드가 실행된다면 사용자가 '확인'을 선택한 것
    }
    
    // 새 설정 생성
    const newSetting = {
        name: name,
        prices: {
            wallpaper: {
                small: parseInt(document.getElementById("customSmallPrice").value) || defaultPrices.wallpaper.small,
                wide: parseInt(document.getElementById("customWidePrice").value) || defaultPrices.wallpaper.wide,
                silk: parseInt(document.getElementById("customSilkPrice").value) || defaultPrices.wallpaper.silk
            },
            labor: {
                fullDay: parseInt(document.getElementById("customFullDayCost").value) || defaultPrices.labor.fullDay,
                halfDay: parseInt(document.getElementById("customHalfDayCost").value) || defaultPrices.labor.halfDay
            },
            material: {
                paper: parseInt(document.getElementById("customPaperMaterial").value) || defaultPrices.material.paper,
                silk: parseInt(document.getElementById("customSilkMaterial").value) || defaultPrices.material.silk
            },
            flooring: {
                "1.8": parseInt(document.getElementById("custom18t").value) || defaultPrices.flooring["1.8"],
                "2.0": parseInt(document.getElementById("custom20t").value) || defaultPrices.flooring["2.0"],
                "2.2": parseInt(document.getElementById("custom22t").value) || defaultPrices.flooring["2.2"],
                "2.7": parseInt(document.getElementById("custom27t").value) || defaultPrices.flooring["2.7"],
                "3.2": parseInt(document.getElementById("custom32t").value) || defaultPrices.flooring["3.2"],
                "4.5": parseInt(document.getElementById("custom45t").value) || defaultPrices.flooring["4.5"],
                "5.0": parseInt(document.getElementById("custom50t").value) || defaultPrices.flooring["5.0"]
            }
        }
    };
    
    try {
        // 같은 이름의 설정이 있으면 덮어쓰기, 없으면 추가
        if (existingIndex !== -1) {
            customSettings[existingIndex] = newSetting;
        } else {
            customSettings.push(newSetting);
        }
        
        // 로컬 스토리지에 저장
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SETTINGS, JSON.stringify(customSettings));
        
        // 드롭다운 업데이트
        updateCustomSettingsDropdown();
        
        // 모달 닫기
        closeModal();
        
        // 현재 맞춤설정 선택
        document.getElementById("customSetting").value = existingIndex !== -1 ? existingIndex : customSettings.length - 1;
        
        // 선택된 맞춤설정 적용
        applyCustomSetting();
    } catch (error) {
        console.error("맞춤설정 저장 오류:", error);
        alert("맞춤설정을 저장하는 중 오류가 발생했습니다.");
    }
}

// 맞춤설정 드롭다운 업데이트
function updateCustomSettingsDropdown() {
    try {
        const dropdown = document.getElementById('customSetting');
        if (!dropdown) return; // 페이지에 요소가 없으면 중단
        
        // 기존 옵션 제거 (기본값 옵션 제외)
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }
        
        // 저장된 맞춤설정 옵션 추가
        customSettings.forEach((setting, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = setting.name;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("드롭다운 업데이트 오류:", error);
    }
}

// 로컬 스토리지에서 맞춤설정 불러오기
function loadCustomSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_SETTINGS);
        if (saved) {
            customSettings = JSON.parse(saved);
            updateCustomSettingsDropdown();
        }
    } catch (error) {
        console.error("로컬 스토리지 읽기 오류:", error);
    }
}

// 맞춤설정 적용
function applyCustomSetting() {
    const dropdown = document.getElementById("customSetting");
    if (!dropdown) return;
    
    const selectedValue = dropdown.value;
    
    if (selectedValue === "default") {
        // 기본값 적용
        currentPrices = JSON.parse(JSON.stringify(defaultPrices));
    } else {
        // 선택된 맞춤설정 적용
        const index = parseInt(selectedValue);
        if (!isNaN(index) && customSettings[index]) {
            currentPrices = JSON.parse(JSON.stringify(customSettings[index].prices));
        }
    }
    
    // 결과 업데이트
    updateResults();
}

// ===== PDF 견적서 기능 =====
// PDF 모달 열기
function openPdfModal() {
    const modal = document.getElementById("pdfModal");
    if (modal) {
        modal.style.display = "block";
    }
}

// PDF 모달 닫기
function closePdfModal() {
    const modal = document.getElementById("pdfModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// PDF 다운로드
function downloadPdf() {
    // 고객 및 업체 정보 업데이트
    const customerName = document.getElementById("customerName").value || "-";
    const customerAddress = document.getElementById("customerAddress").value || "-";
    const customerPhone = document.getElementById("customerPhone").value || "-";
    const companyName = document.getElementById("companyName").value || "-";
    const companyContact = document.getElementById("companyContact").value || "-";
    const notes = document.getElementById("notes").value || "-";
    
    document.getElementById("preview-customer").textContent = customerName;
    document.getElementById("preview-address").textContent = customerAddress;
    document.getElementById("preview-phone").textContent = customerPhone;
    document.getElementById("preview-company").textContent = companyName;
    document.getElementById("preview-contact").textContent = companyContact;
    document.getElementById("preview-notes").textContent = notes;
    
    // PDF 생성 및 다운로드
    const element = document.querySelector('.pdf-preview');
    if (!element) return;
    
    const opt = {
        margin: 10,
        filename: `견적서_${customerName}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // PDF 생성
    html2pdf().from(element).set(opt).save();
}

// PDF 견적서 모달 입력 필드 이벤트 리스너
function setupPdfFormListeners() {
    const fields = [
        "customerName", "customerAddress", "customerPhone",
        "companyName", "companyContact", "notes"
    ];
    
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.addEventListener('input', function() {
                const previewId = field === "notes" ? "preview-notes" : 
                                 field === "customerName" ? "preview-customer" :
                                 field === "customerAddress" ? "preview-address" :
                                 field === "customerPhone" ? "preview-phone" :
                                 field === "companyName" ? "preview-company" :
                                 "preview-contact";
                
                const previewElement = document.getElementById(previewId);
                if (previewElement) {
                    previewElement.textContent = this.value || "-";
                }
            });
        }
    });
}

// localStorage에서 견적 데이터 로드하여 PDF 견적서에 표시
function loadEstimateDataForQuote() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEYS.ESTIMATE_DATA);
        if (!savedData) {
            alert("견적 데이터가 없습니다. 먼저 견적을 작성해주세요.");
            window.location.href = 'estimate.html';
            return;
        }
        
        const data = JSON.parse(savedData);
        
        // 날짜 설정
        const dateObj = new Date(data.createdAt);
        const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        document.getElementById("preview-date").textContent = dateString;
        
        // 평형 정보 설정
        const sizeText = `${data.houseSize}평 (${Math.round(data.houseSize * 3.3)}㎡)`;
        document.getElementById("preview-size").textContent = sizeText;
        
        // 금액 정보 설정
        document.getElementById("preview-wallpaper").textContent = data.wallpaperPrice.toLocaleString() + "원";
        document.getElementById("preview-labor").textContent = data.laborCost.toLocaleString() + "원";
        document.getElementById("preview-material").textContent = data.materialCost.toLocaleString() + "원";
        document.getElementById("preview-extra").textContent = data.extraCost.toLocaleString() + "원";
        
        // 장판 정보 설정
        let flooringTypeText = "";
        if (data.flooringType) {
            flooringTypeText = `KCC ${data.flooringType}t`;
        }
        document.getElementById("preview-flooring-type").textContent = flooringTypeText;
        document.getElementById("preview-flooring-area").textContent = (flooringAreas[data.houseSize] || 0) + "평";
        document.getElementById("preview-flooring").textContent = data.flooringPrice.toLocaleString() + "원";
        
        // 총 금액 설정
        document.getElementById("preview-total").textContent = data.grandTotal.toLocaleString() + "원";
    } catch (error) {
        console.error("견적 데이터 로드 오류:", error);
        alert("견적 데이터를 불러오는 중 오류가 발생했습니다.");
    }
}

// ===== 페이지 초기화 및 이벤트 핸들러 설정 =====
// 이벤트 리스너 설정 (견적 프로그램)
function setupEstimateEventListeners() {
    // 폼 변경 이벤트
    document.getElementById("houseSize").addEventListener('change', updateResults);
    document.getElementById("livingWallpaper").addEventListener('change', updateResults);
    document.getElementById("roomWallpaper").addEventListener('change', updateResults);
    document.getElementById("extraCost").addEventListener('input', updateResults);
    document.getElementById("flooringType").addEventListener('change', updateResults);

    // 맞춤설정 이벤트
    document.getElementById("customSetting").addEventListener('change', applyCustomSetting);
    document.getElementById("createCustomBtn").addEventListener('click', openModal);
    document.getElementById("editCustomBtn").addEventListener('click', editCustomSetting);
    document.getElementById("deleteCustomBtn").addEventListener('click', deleteCustomSetting);
    
    // 모달 이벤트
    document.querySelectorAll(".close-modal").forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = "none";
        });
    });
    
    document.querySelector("#customModal .save-btn").addEventListener('click', saveCustomSetting);
    document.querySelector("#customModal .cancel-btn").addEventListener('click', closeModal);
    
    // 견적서 이동 버튼
    document.getElementById("createPdfBtn").addEventListener('click', goToQuote);
}

// 이벤트 리스너 설정 (PDF 견적서)
function setupQuoteEventListeners() {
    // PDF 견적서 폼 리스너 설정
    setupPdfFormListeners();
    
    // PDF 다운로드 버튼
    document.getElementById("downloadPdfBtn").addEventListener('click', downloadPdf);
}

// 페이지 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 종류 확인 (견적 프로그램인지 PDF 견적서인지)
    const isEstimatePage = document.getElementById("houseSize") !== null;
    const isQuotePage = document.getElementById("preview-total") !== null;
    
    // 맞춤 설정 로드 (공통)
    loadCustomSettings();
    
    if (isEstimatePage) {
        // 견적 프로그램 페이지 초기화
        setupEstimateEventListeners();
        updateResults();
    } else if (isQuotePage) {
        // PDF 견적서 페이지 초기화
        setupQuoteEventListeners();
        loadEstimateDataForQuote();
    }
});