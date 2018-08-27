<template>
	<!--文件列表-->
	<div class="list-container" :class="{active: showList}">

		<div class="click_me" @click="showList = !showList">视频列表</div>

		<div class="filterCon">
			<div>
				<input
					title="点击选择文件夹"
					class="folder"
					@change="setList"
					multiple
					webkitdirectory
					mozdirectory
					directory
					accept="video/x-matroska,video/mp4"
					type="file"
					name="html5uploader"
				>选择文件夹
			</div>
			<div>
				<input type="file" class="file" accept="video/x-matroska,video/mp4"/>选择文件
			</div>

			<input class="filter" @keyup.stop type="text" v-model="filterKey" placeholder="筛选"/>
		</div>

		<!--列表-->
		<ul class="list">
			<li v-for="(li, index) in videoList" class="li" :class="{reading: readingLi === index}" @click="setUrlData(index)" :title="fullNameVideos[index]" v-text="fullNameVideos[index]"></li>
		</ul>
	</div>
</template>

<script>
	export default {
		props: {},
		data() {
			return {
				videos: [],
				showList: false,
				readingLi: null,
				filterKey: '.mkv',
				canHide: false,
			}
		},
		created() {
		},
		mounted() {
			this.$nextTick(() => {
				if (!this.canHide) {
					this.showList = true
				}
				this.init()
				window.reverse = () => {
					this.videos = this.videos.reverse()
				}
			})
		},
		watch: {},
		filters: {},
		computed: {
			videoList: function() {
				return this.videos.filter(video => {
					let pattern = RegExp(this.filterKey.split('').join('.*'), 'i')
					let fileName = video.webkitRelativePath.split('/').slice(1).join('/')
					return pattern.test(fileName)
				})
			},
			fullNameVideos: function() {
				return this.videoList.map(video => {
					// console.log(video.webkitRelativePath)
					return video.webkitRelativePath.split('/').slice(1).join('/')
				})
			},
			nextList: function() {
				if (this.readingLi + 1 >= this.videoList.length) {
					return null
				}
				else {
					return this.readingLi + 1
				}
			},
		},
		methods: {
			init() {
				document.addEventListener('keyup', event => {
					if (event.keyCode === 76) { // L键
						this.showList = !this.showList
					}
				})
			},
			setList(e) {
				// console.log(e.currentTarget.files)
				this.videos = [].filter.call(e.currentTarget.files, function(file) {
					return /^video\//i.test(file.type)
					// return /(\.mkv$)/i.test(file.name)
					// return /(\.mp4$)|(\.mkv$)/i.test(file.name)
				})
			},
			setNextUrl() {
				if (this.nextList) {
					this.setUrlData(this.nextList)
				}
			},
			setUrlData(index) {
				this.readingLi = index
				let videoData = window.URL.createObjectURL(this.videoList[index])
				this.$emit('urlData', videoData, this.fullNameVideos[index])
				if (this.canHide) {
					this.showList = false
				}
			},
			liHidden: function(item) {
			},
		}
	}
</script>

<style lang="less" scoped>
	@import "../common/style/reset";

	/*列表主题色*/
	// @listMainBackgroundColor: rgba(255, 255, 255, 0.6);
	@listMainBackgroundColor: rgba(20, 25, 30, 0.6);
	// @buttonColor: rgb(0, 0, 0);
	@buttonColor: #B5B9BC;


	/*列表容器*/
	.list-container {
		width: 300px;
		height: 100%;
		position: fixed;
		left: 100%;
		top: 0;
		background-color: @listMainBackgroundColor;
		z-index: 100;
		transition: transform 0.3s ease;

		&.active{
			transform: translateX(-100%);

			.click_me {
				opacity: 1;
			}
		}

		/*列表展开收起按钮*/
		.click_me {
			width: 3em;
			margin-top: -10px;
			padding: 0.5em 1em;
			box-sizing: border-box;
			border-radius: 6px 0 0 6px;
			text-align: center;
			color: @buttonColor;
			background-color: @listMainBackgroundColor;
			top: 50%;
			position: absolute;
			left: -3em;
			cursor: pointer;
			-webkit-user-select: none;
			transition: all 0.3s ease;
			opacity: 0.3;

			&:hover {
				color: white;
				background-color: @listMainBackgroundColor;
			}
		}

		/*文件筛选容器*/
		.filterCon {
			width: 100%;
			overflow: hidden;
			clear: both;
			position: relative;
			top: 0;

			/*两个筛选按钮*/
			div {
				width: 50%;
				height: 40px;
				line-height: 40px;
				color: @buttonColor;
				border-right: 1px solid #fff;
				box-sizing: border-box;
				float: left;
				text-align: center;
				position: relative;
				transition: color 0.3s ease;

				&:hover {
					color: white;
				}

				&:nth-child(2) {
					border-right: none;
				}

				input {
					width: 100%;
					height: 100%;
					opacity: 0;
					position: absolute;
					left: 0;
					cursor: pointer;
				}
			}

			/*筛选输入框*/
			input {
				width: 100%;
				height: 32px;
				padding: 0 8px;
				outline: none;
				border: none;
				//border-left: 1px solid @listMainBackgroundColor;
				box-sizing: border-box;
			}
		}

		.list {
			width: 100%;
			padding: 15px 0 15px 20px;
			box-sizing: border-box;
			overflow: auto;
			position: absolute;
			top: 72px;
			bottom: 0;
			color: #bbb;

			.li {
				max-width: 94%;
				height: 22px;
				margin: 5px 10px 10px 15px;
				font-size: 13px;
				line-height: 22px;
				overflow: hidden;
				cursor: pointer;
				float: left;
				clear: both;
				box-sizing: border-box;
				.ellipsisNormal();

				&:hover {
					color: rgb(255, 255, 255);
				}

				&.reading {
					color: rgb(255, 255, 255);
				}
			}
		}
	}
</style>
