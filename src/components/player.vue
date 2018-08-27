<template>
	<!--播放器容器-->
	<div
		class="player-container"
		ref="player-container"
		@mousemove="showTools"
		@touchmove="showTools"
	>
		<!--播放器标签-->
		<video
			id="video"
			:class="{mouseStop: isMouseStop}"
			ref="video"
			:src="videoSrc"
			@click="togglePlay"
			@dblclick="fullScreenToggle"
			@loadedmetadata="loadedmetadata"
			@ended="ended"
			@mousemove="mousemove"
		></video>

		<div class="topBar" :class="{'tools-show': toolsShow}">
			<div class="con">
				<!--锁定状态-->
				<div class="lock" :class="lockedStatus" @click="toggleLock"></div>
				<!--音量状态-->
				<div class="volume">
					<span class="icon-volume-down"></span>
					<span>{{ Math.ceil(volume * 100) }}%</span>
				</div>
				<!--当前时间-->
				<div class="time">{{ time }}</div>
			</div>
		</div>

		<!--工具-->
		<div class="tools-box" :class="{'tools-show': toolsShow}"
			 @mousemove.stop="mouseMoveInTools"
			 @mouseout.stop="showTools"
		>

			<!--暂停、继续按钮-->
			<div class="toggle" @click="togglePlay">
				<div v-if="paused" class="btn playButton"></div>
				<div v-else class="btn pauseButton"></div>
			</div>

			<!--进度条-->
			<div class="progressCon" ref="progressCon" @mousemove="progressMouseMove" @mouseup="setProgress">
				<div class="progressBar" :style="`width: ${progress}`">
					<div class="progress"></div>
				</div>

				<!--播放时间-->
				<div class="playTime">
					<span class="current">{{ currentTime | formatTime }}</span> / <span class="totalTime">{{ duration | formatTime }}</span>
				</div>

				<div class="hoverLine" :style="`left: ${hoverProgress}px;`"></div>
			</div>

			<!--播放速度-->
			<div class="speed-box">
				<div class="speed">
					<ul>
						<li v-for="(li, index) in speedList" @click="setPlaySpeed(index)">{{ li }}x</li>
						<li>{{ speedList[speedIndex] }}x</li>
					</ul>
				</div>
			</div>

			<!--全屏按钮-->
			<div class="fullScreen" :class="fullScreenStatus" @click="fullScreenToggle"></div>
		</div>

		<!--<div class="test" style="position: absolute; top: 50%; left: 50%; background-color: white">({{ test }})</div>-->
	</div>
</template>

<script>
	const logInfo = {
		volume_value_err: 'volume value need a number.',
	}
	const defaultSpeedIndex = 2
	export default {
		props: {
			src: {
				type: String,
				required: true,
			},
			title: {
				type: String,
				default: '',
			},
			isFullScreen: {
				type: Boolean,
				default: false,
			},
		},
		data() {
			let _this = this
			return {
				playerContainer: '',
				video: '',
				isMouseStop: false,
				mouseStopTimer: null,
				mouseStopTime: 1000,
				progressHoverPosition: 0,
				paused: true,
				currentTime: 0,
				duration: 0,
				updateInterval: null,
				progress: '',
				hoverProgress: 0,
				speedList: ['0.5', '0.75', '1.0', '1.25', '1.5', '1.75', '2.0', '2.5', '3.0'],
				speedIndex: defaultSpeedIndex,
				isImmediatelyPlay: false,
				volume: 0.6,
				time: '00:00',
				_locked: false,
				get locked() {
					return this._locked
				},
				set locked(val) {
					this._locked = val
					_this.showTools()
					return val
				},
				_toolsShow: true,
				get toolsShow() {
					return this._toolsShow
				},
				set toolsShow(val) {
					this._toolsShow = this.locked || val
					return this._toolsShow
				},
				toolsShowTime: 1500,
				msg: '',

				// test: '',
			}
		},
		beforeCreate() {
			this.$nextTick(() => {
				this.init()
			})
		},
		created() {
		},
		mounted() {
		},
		filters: {
			formatTime(time) {
				if (isNaN(time)) {
					return '00:00'
				}
				time = parseInt(time)
				let minutes = parseInt(time / 60)
				let seconds = time % 60
				return padLeft(minutes) + ':' + padLeft(seconds)

				function padLeft(num) {
					return num < 10 ? '0' + num : num
				}
			},
		},
		watch: {
			paused(val) {
				this.showTools()
				if (!val) {
					clearInterval(this.updateInterval)
					this.updateInterval = setInterval(() => {
						this.updateProgress()
					}, 200)
				}
				else {
					clearInterval(this.updateInterval)
				}
			},
		},
		computed: {
			videoSrc() {
				return this.src
			},
			fullScreenStatus() {
				let status = this.isFullScreen ? 'exit-full-screen' : 'full-screen'
				let obj = {}
				obj['icon-' + status] = true
				return obj
			},
			lockedStatus() {
				let status = this.locked ? 'locked' : 'unlocked'
				let obj = {}
				obj['icon-' + status] = true
				return obj
			},
		},
		methods: {
			init() {
				this.playerContainer = this.$refs['player-container']
				this.video = this.$refs.video

				this.setPlaySpeed(this.speedIndex)
				this.setVolume(this.volume)
				this.setTime()

				document.addEventListener('keyup', event => {
					console.log(event.keyCode)

					if (event.keyCode === 32) { // 空格键
						this.togglePlay()
					}
					else if (event.keyCode === 13) { // 回车键
						// this.fullScreen()
						this.fullScreenToggle()
					}
					else if (event.keyCode === 37) { //左方向键
						this.fastBackward(event)
					}
					else if (event.keyCode === 39) { //右方向键
						this.fastForward(event)
					}
					else if (event.keyCode === 38) { //上方向键
						if (event.ctrlKey) {
							this.changeVolume(0.3)
						}
						else {
							this.changeVolume(0.1)
						}
					}
					else if (event.keyCode === 40) { //下方向键
						if (event.ctrlKey) {
							this.changeVolume(-0.3)
						}
						else {
							this.changeVolume(-0.1)
						}
					}
					else if (event.keyCode === 188) { // 左尖括号键
						let nextIndex = this.speedIndex ? this.speedIndex - 1 : 0
						this.setPlaySpeed(nextIndex)
					}
					else if (event.keyCode === 190) { // 右尖括号键
						let nextIndex = this.speedIndex + 1 === this.speedList.length ? this.speedIndex : this.speedIndex + 1
						this.setPlaySpeed(nextIndex)
					}
					else if (event.keyCode === 191) { // 斜杠键
						this.setPlaySpeed(defaultSpeedIndex)
					}
					else if (event.keyCode === 27) { // ESC键
						this.exitFullScreen()
					}
					else if (event.keyCode === 83) { // S
						this.toggleLock()
					}
				})

				window.addEventListener("orientationchange", this.orientationchange)
			},
			loadedmetadata() {
				this.paused = this.video.paused
				this.duration = Math.ceil(this.video.duration)
				this.setPlaySpeed(this.speedIndex)
				this.setHtmlTitle()
				if (this.isImmediatelyPlay) {
					this.play()
					this.isImmediatelyPlay = false
				}
			},
			fastForward() {
				let video = this.video
				if (event.ctrlKey) {
					video.currentTime = video.currentTime + 30
				}
				else {
					video.currentTime = video.currentTime + 10
				}

				if (video.currentTime > video.duration) {
					video.currentTime = video.duration
				}
				this.updateProgress()
			},
			fastBackward() {
				let video = this.video
				if (event.ctrlKey) {
					video.currentTime = video.currentTime - 30
				}
				else {
					video.currentTime = video.currentTime - 10
				}

				if (video.currentTime < 0) {
					video.currentTime = 0
				}
				this.updateProgress()
			},
			changeVolume(volume) {
				let video = this.video
				volume = Number(volume)

				if (isNaN(volume)) {
					console.error(logInfo.volume_value_err)
					return false
				}

				volume = video.volume + volume

				volume = volume > 1 ? 1 : volume
				volume = volume < 0 ? 0 : volume
				video.volume = volume
				this.msg && this.msg.close()
				this.msg = this.$message({
					message: `音量: ${Math.ceil(volume * 100)}%`,
					center: true
				})
				this.getVideoStatus()
			},
			// 设置音量
			setVolume(volume) {
				let video = this.video
				volume = Number(volume)

				if (isNaN(Number(volume))) {
					console.error(logInfo.volume_value_err)
					return false
				}

				volume = volume > 1 ? 1 : volume
				volume = volume < 0 ? 0 : volume
				video.volume = volume
				this.getVideoStatus()
			},

			// 切换锁定状态
			toggleLock() {
				this.locked = !this.locked
			},

			fullScreenToggle() {
				this.$emit('fullScreenToggle')
			},
			// 设置进度
			setProgress(event) {
				if (event.button === 0) {
					let currentLength = event.clientX - this.$refs['player-container'].offsetLeft - this.$refs.progressCon.offsetLeft
					let length = parseInt(getComputedStyle(this.$refs.progressCon).width)
					this.video.currentTime = (this.duration * currentLength / length)
					this.updateProgress()
				}
			},
			progressMouseMove(event) {
				this.hoverProgress = event.clientX - this.$refs['player-container'].offsetLeft - this.$refs.progressCon.offsetLeft
			},
			updateProgress() {
				let video = this.video
				this.currentTime = Math.ceil(video.currentTime)
				this.progress = 100 * video.currentTime / video.duration + '%'
			},
			setPlaySpeed(speedIndex) {
				this.video.playbackRate = this.speedList[speedIndex]
				this.speedIndex = speedIndex
			},
			togglePlay() {
				this.paused ? this.play() : this.pause()
			},
			immediatelyPlay() {
				this.isImmediatelyPlay = true
			},
			play() {
				this.video.play()
				this.getPaused()
			},
			pause() {
				this.video.pause()
				this.getPaused()
			},
			ended() {
				this.getPaused()
				this.$emit('ended')
			},
			getPaused() {
				this.paused = this.video.paused
			},
			getVideoStatus() {
				let video = this.video
				this.paused = video.paused
				this.volume = video.volume
			},
			setHtmlTitle() {
				document.title = this.title ? `${this.title} - webPlayer` : 'webPlayer'
			},
			setTime() {
				clearInterval(this.setTime.interval)
				this.setTime.interval = setInterval(() => {
					let now = new Date()
					let hours = now.getHours()
					let minutes = now.getMinutes()
					this.time = `${formatNum(hours)}:${formatNum(minutes)}`
				}, 500)

				function formatNum(val) {
					return val > 9 ? val : '0' + val
				}
			},
			showTools() {
				this.toolsShow = true
				clearTimeout(this.showTools.timeout)
				this.showTools.timeout = setTimeout(() => {
					this.toolsShow = false
				}, this.toolsShowTime)
			},
			mouseMoveInTools() {
				clearTimeout(this.showTools.timeout)
			},
			orientationchange() {
				console.log('orientationchange', window.orientation)	// 真实设备有效
			},
			mousemove() {
				this.isMouseStop = false
				clearTimeout(this.mouseStopTimer)
				this.mouseStopTimer = setTimeout(() => {
					this.isMouseStop = true
				}, this.mouseStopTime)
			},
		}
	}
</script>

<style lang="less" scoped>
	@mainColor: #ccc;

	/*播放器容器*/
	.player-container {
		width: 100%;
		height: 100%;
		margin: 0 auto;
		background-color: #000;
		color: @mainColor;
		position: relative;
		overflow: hidden;
		-webkit-user-select: none;

		#video {
			width: 100%;
			height: 100%;
			max-width: 100vw;
			max-height: 100vh;
			/*height: calc(~'(100% - 40px)');*/
			display: block;
			/*opacity: 0;*/
			/*background-color: black;*/

			&.mouseStop {
				cursor: none;
			}
		}

		.tools-show{
			transform: translateY(0) !important;
		}

		@showTime: 0.4s;
		@height: 40px;
		.topBar {
			width: 100%;
			height: @height;
			padding: 0 1rem;
			box-sizing: border-box;
			position: absolute;
			top: 0;
			/*top: calc(~'(100% - 8px)');*/
			transform: translateY(calc(~'(-40px + 8px)'));
			transition: transform @showTime ease-out;

			.con {
				float: right;

				> * {
					display: inline-block;
				}

				*[class^='icon-'] {
					width: @height;
					height: @height;
					line-height: @height;
					text-align: center;
					font-size: 1.25rem;
					vertical-align: top;
					color: rgba(255, 255, 255, 1);
				}

				.lock {
					width: @height;
					height: @height;
					line-height: @height;
					text-align: center;
					font-size: 1.25rem;
					display: inline-block;
					vertical-align: top;
					color: rgba(255, 255, 255, 0.8);
					cursor: pointer;
					transition: color ease .3s;

					&:hover {
						color: rgba(255, 255, 255, 1);
					}
				}

				.volume {
					span {
						vertical-align: top;
						line-height: 40px;
					}
				}

				.time {
					height: 100%;
					line-height: @height;
					vertical-align: top;
					display: inline-block;
					padding: 0 12px;
				}
			}
		}

		/*工具*/
		.tools-box {
			width: 100%;
			height: 40px;
			display: flex;
			position: absolute;
			bottom: 0;
			/*top: calc(~'(100% - 8px)');*/
			transform: translateY(calc(~'(40px - 8px)'));
			transition: transform @showTime ease;
			background-color: rgba(0, 0, 0, 0.4);

			/*暂停、播放按钮*/
			.toggle {
				flex: 0 0 40px;
				width: 40px;
				height: 40px;
				cursor: pointer;

				&:hover {
					.playButton {
						border-left-color: #fff;
					}

					.pauseButton {
						border-color: #fff;
					}
				}

				.playButton {
					border: 8px solid transparent;
					border-left: 12px solid @mainColor;
					margin: 12px 15px;
				}

				.pauseButton {
					margin: 12px auto;
					width: 6px;
					height: 17px;
					border-left: 4px solid @mainColor;
					border-right: 4px solid @mainColor;
				}
			}

			.hover {

				/*可拖动滑块*/
				.progress {
					background-color: #00a0e9;
				}
			}

			/*进度条容器*/
			.progressCon {
				width: 100%;
				height: 40px;
				background-color: rgba(0, 0, 0, 0.1);
				cursor: pointer;
				box-shadow: 0 0 10px 10px rgba(0, 0, 10px, 0.02) inset;
				position: relative;

				&:hover {

					.hoverLine {
						display: block;
					}
				}

				/*进度*/
				.progressBar {
					height: 100%;
					background: -webkit-linear-gradient(left, rgba(21, 141, 210, 0.1), rgba(21, 141, 210, 0.5));
					width: 0;
					position: relative;

					/*可拖动滑块*/
					.progress {
						width: 2px;
						height: 100%;
						float: right;
						background-color: #158dd2;
					}
				}

				/*播放时间*/
				.playTime {
					@height: 40px;
					height: @height;
					margin-left: 20px;
					position: absolute;
					top: 0;

					span {
						height: @height;
						line-height: @height;
						display: inline-block;
					}
				}

				.hoverLine {
					position: absolute;
					top: 0;
					width: 1px;
					height: 100%;
					background-color: #158dd2;
					display: none;
				}
			}

			/*播放速度*/
			.speed-box {
				flex: 0 0 100px;
				position: relative;

				.speed {
					@border-color: rgba(255, 255, 255, 0.6);

					width: 80px;
					height: 30px;
					margin: 0 auto;
					position: relative;
					top: 50%;
					transform: translateY(-50%);

					ul {
						box-shadow: 0 0 1px 1px @border-color;
						position: absolute;
						bottom: 0;
						text-align: center;

						&:hover {
							color: @border-color;

							li {
								display: block;

								&:nth-last-child(2) {
									border-color: rgba(44, 44, 44, 0.5);
								}

								&:last-child {
									display: none;
								}
							}
						}

						li {
							width: 80px;
							height: 30px;
							line-height: 30px;
							background-color: rgba(44, 44, 44, 0.5);
							border-bottom: 1px solid @border-color;
							cursor: pointer;
							box-sizing: border-box;
							display: none;

							&:hover {
								color: white;
								background-color: rgba(44, 44, 44, 0.8);
							}

							&:last-child {
								border-color: rgba(44, 44, 44, 0.5);
								display: block;
							}
						}
					}
				}
			}

			.fullScreen {
				flex: 0 0 40px;
				font-size: 18px;
				text-indent: 5px;
				line-height: 40px;

				&:hover {
					color: white;
					cursor: pointer;
				}
			}
		}
	}
</style>
