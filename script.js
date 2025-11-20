// Biến theo dõi trang hiện tại
let currentPage = 1;

/**
 * Chức năng chuyển trang/view
 * @param {number} pageNumber - Số trang cần chuyển đến
 */
function nextPage(pageNumber) {
    // Nếu chuyển từ trang 1 sang trang 2, kích hoạt hiệu ứng gõ chữ
    if (pageNumber === 2) {
        startTypingEffect();
    }
    
    // Ẩn trang hiện tại
    document.getElementById(`page${currentPage}`).classList.remove('active');
    
    // Cập nhật và hiển thị trang mới
    currentPage = pageNumber;
    document.getElementById(`page${currentPage}`).classList.add('active');
}

/* ==========================================================
 * PAGE 2 LOGIC: HIỆU ỨNG GÕ CHỮ
 * ========================================================== */
const wishTextElement = document.getElementById('wish-text');

const nextToGameButton = document.getElementById('next-to-game');

// Thay đổi lời chúc này!
const WISH_MESSAGE = 
    "Chúc mừng sinh nhật Chi!\n\n" +
    "Hôm nay là một ngày thật đặc biệt, và mình muốn gửi đến Chi những lời chúc chân thành nhất. Chúc Chi luôn khỏe mạnh, giữ được nụ cười đáng yêu và có thật nhiều năng lượng tích cực.\n\n" +
    "Mong rằng mọi ước mơ của Chi đều sẽ trở thành hiện thực một cách nhẹ nhàng nhất. Hy vọng cuộc sống mang đến cho Chi những cơ hội tốt và thật nhiều khoảnh khắc tự hào về chính mình.\n\n" +
    "Món Quà Be Bé Tặng Chi Nhé 👉👈";

let charIndex = 0;

function typeChar() {
    if (charIndex < WISH_MESSAGE.length) {
        let char = WISH_MESSAGE.charAt(charIndex);
        
        if (char === '\n') {
            wishTextElement.innerHTML += "<br>"; 
        } else {
            wishTextElement.innerHTML += char; 
        }        
        charIndex++;
        setTimeout(typeChar, 50); 
    } else {
        nextToGameButton.disabled = false;
        nextToGameButton.onclick = () => nextPage(3);
    }
}

function startTypingEffect() {
    wishTextElement.innerHTML = ""; 
    charIndex = 0;
    typeChar();
}

/* ==========================================================
 * PAGE 3 LOGIC: MINIGAME ĐẬP ẾCH
 * ========================================================== */

const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const holes = document.querySelectorAll('.hole');
const START_TIME = 30;
const WIN_SCORE = 5;

let score = 0;
let timeRemaining = START_TIME;
let timerInterval;
let moleInterval;
let gameActive = false;

function randomHole(excludeIndex) {
    const indices = [...Array(holes.length).keys()].filter(i => i !== excludeIndex);
    return indices[Math.floor(Math.random() * indices.length)];
}

function peep() {
    // Nếu game chưa active hoặc hết giờ, dừng lại
    if (!gameActive) return;

    let previousIndex = -1;
    let randomIndex = randomHole(previousIndex);
    const hole = holes[randomIndex];
    
    // Đảm bảo không có 2 ếch xuất hiện cùng lúc ở cùng 1 chỗ
    if (hole.classList.contains('up')) {
        peep(); // Thử lại
        return;
    }

    hole.classList.add('up');

    const time = Math.random() * 1000 + 500; // Thời gian ếch hiện (0.5s đến 1.5s)
    setTimeout(() => {
        hole.classList.remove('up');
        previousIndex = randomIndex;
        
        // Gọi lại để ếch khác xuất hiện
        if (gameActive) {
            peep();
        }
    }, time);
}

function whack(index) {
    if (!gameActive) return;

    const hole = holes[index];
    if (hole.classList.contains('up')) {
        score++;
        scoreElement.textContent = score;
        hole.classList.remove('up'); // Ếch bị đập thì biến mất ngay
    }
}

function updateTimer() {
    timeRemaining--;
    timerElement.textContent = timeRemaining;

    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        gameActive = false;
        
        // Chờ thêm 1 giây để ếch cuối cùng biến mất
        setTimeout(() => {
            endGame(score >= WIN_SCORE);
        }, 1000); 
    }
}

function startMiniGame() {
    // Reset trạng thái game
    score = 0;
    timeRemaining = START_TIME;
    scoreElement.textContent = score;
    timerElement.textContent = timeRemaining;
    gameActive = true;
    
    // Bắt đầu đếm ngược
    timerInterval = setInterval(updateTimer, 1000);

    // Bắt đầu ếch xuất hiện (peeping)
    peep();
    
    // Ẩn nút "Bắt đầu Game"
    document.querySelector('.start-game-button').style.display = 'none';
}

function endGame(isWinner) {
    let message = "";
    if (isWinner) {
        message = "Tuyệt vời! Bạn đã chiến thắng Minigame! Giờ thì nhận quà nhé!";
    } else {
        message = "Ôi, tiếc quá! Bạn chưa đạt được 5 điểm. Nhưng không sao, quà vẫn là của bạn!";
    }
    alert(`Game Over! ${message}`);

    // Chuyển sang Trang Quà Tặng
    nextPage(4);
    showGiftPage(isWinner);
}


/* ==========================================================
 * PAGE 4 LOGIC: QUÀ TẶNG & HIỆU ỨNG
 * ========================================================== */

function showGiftPage(isWinner) {
    const resultMessageElement = document.getElementById('result-message');
    const giftLink = document.getElementById('gift-link');
    
    // Cập nhật thông báo thắng/thua
    if (isWinner) {
        resultMessageElement.textContent = "🏆 CHÚC MỪNG BẠN ĐÃ LÀ NGƯỜI CHIẾN THẮNG! 🏆";
        giftLink.style.backgroundColor = '#4caf50'; // Màu xanh lá cho người thắng
    } else {
        resultMessageElement.textContent = "💖 NHƯNG KHÔNG SAO ĐÂU, QUÀ VẪN LÀ CỦA BẠN! 💖";
        giftLink.style.backgroundColor = '#ff9800'; // Màu cam
    }

    // Kích hoạt hiệu ứng Confetti (pháo hoa)
    runConfetti();
}

function runConfetti() {
    // Tạo 3 lần bắn pháo hoa
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    setTimeout(() => {
        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.8, x: 0.5 }
        });
    }, 500);
    
    setTimeout(() => {
        confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.4 }
        });
    }, 1000);
}
