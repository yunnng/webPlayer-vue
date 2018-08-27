<template>
	<div class="wrapper">
		<el-row>
			<el-col :xs="24" :lg="{span: 14, offset: 5}">
				<div
					class="player-wrapper"
					ref="player-wrapper"
					@mozfullscreenchange="fullScreenChange"
					@webkitfullscreenchange="fullScreenChange"
					style="width: 100%;"
				>
					<player
						ref="player"
						:src="src"
						:title="title"
						:isFullScreen="isFullScreen"
						@ended="ended"
						@fullScreenToggle="fullScreenToggle"
					></player>
					<fileList ref="fileList" @urlData="playVideo"></fileList>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import player from '../components/player.vue'
	import fileList from '../components/fileList.vue'
	export default {
		components: {
			player,
			fileList,
		},
		data() {
			return {
				src: require('../assets/media/WizKhalifa,CharliePuth-SeeYouAgain.mp4'),
				title: 'See You Again',

				// 当前全屏状态
				isFullScreen: false,
			}
		},
		created() {
		},
		mounted() {
		},
		computed: {},
		methods: {
			playVideo(urlData, title) {
				this.src = urlData
				this.title = title
				this.$refs.player.immediatelyPlay()
			},
			ended() {
				this.$refs.fileList.setNextUrl()
			},

			// 全屏状态改变回调
			fullScreenChange() {
				this.getFullScreenStatus()
			},
			getFullScreenStatus() {
				if (document.fullscreenElement ||    // alternative standard method
					document.mozFullScreenElement || document.webkitFullscreenElement) {  // current working methods
					this.isFullScreen = true
				}
				else if (!document.fullscreenElement &&    // alternative standard method
					!document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
					this.isFullScreen = false
				}
			},
			fullScreenToggle() {
				this.isFullScreen ? this.exitFullScreen() : this.fullScreen()
			},
			fullScreen() {
				let container = this.$refs['player-wrapper']
				if (!this.isFullScreen) {
					if (container.requestFullscreen) {
						container.requestFullscreen()
					}
					else if (container.mozRequestFullScreen) {
						container.mozRequestFullScreen()
					}
					else if (container.webkitRequestFullscreen) {
						container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
					}
					this.getFullScreenStatus()
				}
			},
			// 退出全屏
			exitFullScreen() {
				if (this.isFullScreen) {
					if (document.exitFullscreen) {
						document.exitFullscreen()
					}
					else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen()
					}
					else if (document.webkitCancelFullScreen) {
						document.webkitCancelFullScreen()
					}
				}
				this.getFullScreenStatus()
			},
		}
	}
</script>

<style lang="stylus" scoped>
	.wrapper{
		/*width: 1000px;*/
		margin: 50px auto 0;
	}
</style>
