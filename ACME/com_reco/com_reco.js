// 전역 변수 선언
let allData = []; // 모든 데이터를 저장할 배열
let filteredData = []; // 필터링된 데이터를 저장할 배열
const itemsPerPage = 10; // 페이지당 표시할 항목 수
let currentPage = 1; // 현재 페이지 번호

// DOM 요소 캐싱
const outputElement = document.getElementById('output');
const paginationElement = document.getElementById('pagination');
const addressFilterElement = document.getElementById('addressFilter');
const searchInputElement = document.getElementById('searchInput');

// 디바운스 함수
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// 페이지 로드 시 자동으로 데이터 불러오기
window.addEventListener('DOMContentLoaded', loadExcel);

// Excel 파일 로드 및 초기 데이터 설정
async function loadExcel() {
    try {
        // GitHub에서 Excel 파일 가져오기
        const url = 'https://raw.githubusercontent.com/mdr0415/241016/refs/heads/main/company.xlsx';
        const response = await fetch(url);
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        allData = XLSX.utils.sheet_to_json(worksheet);

        // 지역 필터 옵션 설정
        const addresses = [...new Set(allData.map(item => item.adress).filter(Boolean))];
        addressFilterElement.innerHTML = '<option value="">모든 지역</option>' +
            addresses.map(address => `<option value="${address}">${address}</option>`).join('');

        filterAndDisplayData();
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading excel file:', error);
    }
}

// 데이터 필터링 및 표시
const filterAndDisplayData = debounce(() => {
    const addressFilter = addressFilterElement.value.toLowerCase();
    const searchText = searchInputElement.value.toLowerCase();

    filteredData = allData.filter(item => {
        const matchesAddress = !addressFilter || (item.adress && item.adress.toLowerCase() === addressFilter);
        const matchesSearch = !searchText ||
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.adress && item.adress.toLowerCase().includes(searchText));
        return matchesAddress && matchesSearch;
    });

    currentPage = 1;
    displayData();
    setupPagination();
}, 300);

// 데이터 화면에 표시
function displayData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    
    outputElement.innerHTML = filteredData.slice(startIndex, endIndex)
        .map(item => `
            <div class="job-item">
                <div class="item-number">No. ${item.no || ''}</div>
                <div class="item-title">${item.name || ''}</div>
                <div class="item-info">주소: ${item.adress || ''}</div>
            </div>
        `).join('');
}

// 페이지네이션 설정
function setupPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    paginationElement.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">이전</button>
        <span class="page-info">${currentPage} / ${totalPages}</span>
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">다음</button>
    `;
}

// 페이지 변경 함수
function changePage(newPage) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayData();
        setupPagination();
    }
}

// 이벤트 리스너 설정
addressFilterElement.addEventListener('change', filterAndDisplayData);
searchInputElement.addEventListener('input', filterAndDisplayData);
