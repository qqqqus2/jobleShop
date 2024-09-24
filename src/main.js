// 전역 변수로 모든 SelectBox 인스턴스를 저장
let selectBoxes = [];
document.addEventListener('DOMContentLoaded', function () {
  commonUI();
});

function commonUI() {
  const btnSearch = document.querySelector('.btn-search');

  btnSearch.addEventListener('click', function (e) {
    e.stopPropagation();
    document.body.classList.toggle('searchOpen');
  });

  updateInputBoxClass();
  setupInputDeletion();
  setupInputLengthUpdate();

  document.addEventListener('input', function (event) {
    if (event.target.closest('.input-box')) {
      updateInputBoxClass();
    }
  });

  // 셀렉트 박스
  const labels = document.querySelectorAll('.select-box .label');
  selectBoxes = Array.from(labels).map((label) => new SelectBox(label));

  // 문서 전체에 클릭 이벤트 리스너 추가
  document.addEventListener('click', closeAllSelectBoxes);

  // 달력
  // Datepicker 초기화
  // 공통 옵션
  // 공통 옵션
  const commonOptions = {
    startDay: 0,
    customDays: ['일', '월', '화', '수', '목', '금', '토'],
    customMonths: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    overlayButton: '선택',
    overlayPlaceholder: '연도 입력 (4자리)',
    customClass: 'custom-datepicker',
    formatter: (input, date, instance) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      input.value = `${year}-${month}-${day}`;
    }
  };

  // 시작일 Datepicker
  const startPicker = datepicker('#start-date', {
    ...commonOptions,
    position: 'bl',
    onSelect: (instance, selectedDate) => {
      endPicker.setMin(selectedDate);
    },
    onShow: (instance) => {
      const endDate = endPicker.dateSelected;
      if (endDate) {
        instance.setMax(endDate);
      }
    }
  });

  // 종료일 Datepicker
  const endPicker = datepicker('#end-date', {
    ...commonOptions,
    position: 'bl',
    onSelect: (instance, selectedDate) => {
      startPicker.setMax(selectedDate);
    },
    onShow: (instance) => {
      const startDate = startPicker.dateSelected;
      if (startDate) {
        instance.setMin(startDate);
      }
    }
  });

  // 오늘 날짜를 기본값으로 설정
  const today = new Date();
  startPicker.setDate(today);
  endPicker.setDate(today);
  endPicker.setMin(today);
}

function updateInputBoxClass() {
  const inputBoxes = document.querySelectorAll('.input-box');

  inputBoxes.forEach((box) => {
    const input = box.querySelector('input');
    const currentLengthElement = box.querySelector('.max-lengTxt .current-length');

    if (input) {
      if (input.value.trim() !== '') {
        box.classList.add('hasValue');
      } else {
        box.classList.remove('hasValue');
      }

      // 현재 텍스트 길이를 업데이트
      if (currentLengthElement) {
        currentLengthElement.textContent = input.value.length;
      }
    }
  });
}

// 인풋요소 초기화 버튼
function setupInputDeletion() {
  const inputBoxes = document.querySelectorAll('.input-box');

  inputBoxes.forEach((box) => {
    const deleteButton = box.querySelector('.input-del');
    const input = box.querySelector('input');

    if (deleteButton && input) {
      deleteButton.addEventListener('click', function () {
        input.value = '';
        updateInputBoxClass();
      });
    }
  });
}

// 인풋요소 최대 20자까지
const MAX_LENGTH = 20;

function setupInputLengthUpdate() {
  const inputBoxes = document.querySelectorAll('.input-box');

  inputBoxes.forEach((box) => {
    const input = box.querySelector('input');
    const currentLengthElement = box.querySelector('.max-lengTxt .current-length');

    if (input && currentLengthElement) {
      input.addEventListener('input', function () {
        if (this.value.length > MAX_LENGTH) {
          this.value = this.value.slice(0, MAX_LENGTH);
        }
        currentLengthElement.textContent = this.value.length;
        updateInputBoxClass();
      });
    }
  });
}

// 셀렉트 커스템
const ACTIVE_CLASS = 'active';
const toggleClass = (element, className) => element.classList.toggle(className);

class SelectBox {
  constructor(labelElement) {
    this.label = labelElement;
    this.optionList = this.label.nextElementSibling;
    this.optionItems = this.optionList.querySelectorAll('.optionItem');
    this.isActive = false;

    this.init();
  }

  init() {
    this.label.addEventListener('click', (e) => {
      e.stopPropagation(); // 이벤트 버블링 방지
      this.toggleOptions();
    });
  }

  toggleOptions() {
    this.isActive = !this.isActive;
    toggleClass(this.label.parentNode, ACTIVE_CLASS);

    if (this.isActive) {
      this.addOptionListeners();
    } else {
      this.removeOptionListeners();
    }
  }

  addOptionListeners() {
    this.optionItems.forEach((item) => {
      item.addEventListener('click', this.handleSelect.bind(this));
    });
  }

  removeOptionListeners() {
    this.optionItems.forEach((item) => {
      item.removeEventListener('click', this.handleSelect.bind(this));
    });
  }

  handleSelect(event) {
    event.stopPropagation(); // 이벤트 버블링 방지
    const selectedOption = event.target;
    this.label.innerHTML = selectedOption.textContent;
    this.close();
  }

  close() {
    if (this.isActive) {
      this.isActive = false;
      this.label.parentNode.classList.remove(ACTIVE_CLASS);
      this.removeOptionListeners();
    }
  }
}

// 모든 SelectBox를 닫는 함수
function closeAllSelectBoxes(event) {
  // 클릭된 요소가 .select-box 내부가 아닌 경우에만 모든 SelectBox를 닫음
  if (!event.target.closest('.select-box')) {
    selectBoxes.forEach((selectBox) => selectBox.close());
  }
}
