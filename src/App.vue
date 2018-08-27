<template>
	<el-row id="app">
		<el-col :span="24">
			<index></index>
		</el-col>
	</el-row>
</template>

<script>
	import index from './pages/index.vue'
	export default {
		name: 'app',
		components: {
			index,
		},
	}
</script>

<style lang="less">
	html {
		min-height: 100%;
		/*background-color: #000;*/
	}

	#app {
		/*margin-right: 300px;*/
	}
</style>
