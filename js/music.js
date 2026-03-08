document.addEventListener('DOMContentLoaded', function() {
    // if (window.__musicPlayerInited__) return;
    // window.__musicPlayerInited__ = true;
    // 检查配置是否存在
    if (typeof musicConfig === 'undefined' || !musicConfig.playlist || musicConfig.playlist.length === 0) {
        return;
    }

    const playlist = musicConfig.playlist;
    let currentSongIndex = 0;
    let isPlaying = false;

    // 获取DOM元素
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const songTitle = document.getElementById('songTitle');
    const albumArt = document.getElementById('albumArt');
    const widget = document.querySelector('.music-widget');

    // 初始化播放器
    function loadSong(song) {
        songTitle.innerText = `${song.title} - ${song.artist}`;
        audio.src = song.url;
        albumArt.style.backgroundImage = `url("${song.cover}")`;
        
        // 重置进度条
        progressBar.style.width = '0%';
    }

    // 播放歌曲
    function playSong() {
        widget.classList.add('playing');
        playIcon.classList.remove('ri-play-large-fill');
        playIcon.classList.add('ri-pause-large-fill');
        audio.play().catch(e => console.log("Auto-play prevented:", e));
        isPlaying = true;
    }

    // 暂停歌曲
    function pauseSong() {
        widget.classList.remove('playing');
        playIcon.classList.remove('ri-pause-large-fill');
        playIcon.classList.add('ri-play-large-fill');
        audio.pause();
        isPlaying = false;
    }

    // 切换播放状态
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    // 上一首
    prevBtn.addEventListener('click', () => {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = playlist.length - 1;
        }
        loadSong(playlist[currentSongIndex]);
        playSong();
    });

    // 下一首
    nextBtn.addEventListener('click', () => {
        currentSongIndex++;
        if (currentSongIndex > playlist.length - 1) {
            currentSongIndex = 0;
        }
        loadSong(playlist[currentSongIndex]);
        playSong();
    });

    // 更新进度条
    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if(isNaN(duration)) return;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
    });

    // 当前歌曲结束后自动播放下一首
    audio.addEventListener('ended', () => {
        nextBtn.click();
    });

    // 初始加载第一首
    loadSong(playlist[currentSongIndex]);
    
    if (musicConfig.autoplay) {
        playSong();
    }
    
    // ========== 播放列表功能 ==========
(function() {
    // 检查是否有歌曲数据
    if (!playlist || playlist.length === 0) return;

    const pageSize = 5;                 // 每页显示数量
    let currentPage = 1;
    const totalPages = Math.ceil(playlist.length / pageSize);

    const playlistEl = document.getElementById('playlist');
    const prevBtn = document.querySelector('.page-btn.prev');
    const nextBtn = document.querySelector('.page-btn.next');

    // 渲染当前页列表
    function renderPlaylist() {
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, playlist.length);
        const pageSongs = playlist.slice(start, end);

        let html = '';
        pageSongs.forEach((song, idx) => {
            const songIndex = start + idx;  // 全局索引
            html += `
                <li class="playlist-item" data-index="${songIndex}">
                    <span class="item-index">${songIndex + 1}</span>
                    <span class="item-title">${song.title} - ${song.artist}</span>
                </li>
            `;
        });
        playlistEl.innerHTML = html;

        // 更新分页信息
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
    }

    // 点击列表项播放
    playlistEl.addEventListener('click', (e) => {
        const item = e.target.closest('.playlist-item');
        if (!item) return;
        const songIndex = parseInt(item.dataset.index, 10);
        if (songIndex !== currentSongIndex) {
            currentSongIndex = songIndex;
            loadSong(playlist[currentSongIndex]);
            playSong();   // 自动播放
        } else {
            // 点击当前正在播放的歌曲，可切换播放/暂停（可选）
            if (isPlaying) {
                pauseSong();
            } else {
                playSong();
            }
        }
    });

    // 翻页事件
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPlaylist();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPlaylist();
        }
    });

    // 初始渲染
    renderPlaylist();

    // 当通过上一首/下一首切换歌曲时，高亮当前项（可选）
    // 可以在 loadSong 调用后添加一个高亮函数
    const originalLoadSong = loadSong;
    loadSong = function(song) {
        originalLoadSong(song);
        // 高亮当前歌曲对应的列表项
        const items = document.querySelectorAll('.playlist-item');
        items.forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.index, 10) === currentSongIndex) {
                item.classList.add('active');
            }
        });
    };

    // 为高亮添加样式（需在 CSS 中定义）
    // .playlist-item.active {
    //     background: var(--primary-color);
    //     color: var(--white-main);
    // }
    // .playlist-item.active .item-index {
    //     color: var(--white-main);
    // }
})();
});


