<template>
    <div class="main-wrap">
        <div>
            <input type="text" v-model="streamId" placeholder="streamId" :disabled="isPublish">
            <button v-if="!isPublish" @click="publishStream">开始推流</button>
            <button v-if="isPublish" @click="stopPublishStream">停止推流</button>
            <button v-if="!isPlay" @click="playStream">开始拉流</button>
            <button v-if="isPlay" @click="stopPlayStream">停止拉流</button>
        </div>
        <div>
            <h4>推流窗口</h4>
            <video class="video-publish" autoplay muted :srcObject.prop="publishStreamSrc"></video>
        </div>
        <div>
            <h4>拉流窗口</h4>
            <video class="video-play" autoplay muted :srcObject.prop="remoteStream"></video>
        </div>
    </div>
</template>

<script>
import { ZegoClient } from 'webrtc-zego-express'
import axios from 'axios'

export default {
    data() {
        return {
            zg: null,
            token: '',
            publishStreamSrc: '',
            remoteStream: '', // 拉流
            userId: parseInt(Math.random() * 9999).toString() + new Date().valueOf(),
            isPublish: false,
            isPlay: false,
            streamId: ''
        }
    },
    methods: {
        async initZEGO() {
            this.zg = new ZegoClient(2413590698, 'wss://webliveroom-test.zego.im/ws', this.userId)
            this.zg.on('roomStateUpdate', (state, error) => {
                if (state === 'DISCONNECTED') {
                    // 与房间断开了连接
                    console.log('与房间断开了连接',)
                }

                if (state === 'CONNECTING') {
                    // 与房间尝试连接中 
                    console.log('与房间尝试连接中',)
                }

                if (state === 'CONNECTED') {
                    // 与房间连接成功
                    console.log('与房间连接成功',)
                }
            })
            const token = await axios.get('https://wsliveroom-alpha.zego.im:8282/token', {
                params: {
                    'app_id': 2413590698, 'id_name': this.userId
                }
            })
            console.log('token', token.data)
            this.token = token.data
            const roomId = 'test'
            const streamList = await this.zg.login(roomId, this.token)
            console.log('登录房间streamList', streamList)
            this.zg.on('publishStateUpdate', result => {
                //推流状态变更通知
                console.log('推流状态变更', result)
            })
            this.zg.on('publishQualityUpdate', stats => {
                //推流质量
                console.log('推流质量', stats) // 
            })
            this.zg.on('playStateUpdate', result => {
                // 处理拉流状态
                console.log('拉流状态', result)
            })

            this.zg.on('playQualityUpdate', stats => {
                // 拉流质量回调
                console.log('拉流质量回调', stats)
            })
        },
        async publishStream() {
            if (!this.streamId) return alert('房间id')
            this.publishStreamSrc = await this.zg.createLocalStream()
            console.log('推流SRC', this.publishStreamSrc)
            this.zg.startPublishingStream(this.streamId, this.publishStreamSrc)
            this.isPublish = true
        },
        async stopPublishStream() {
            await this.zg.stopPublishingStream(this.streamId)
            this.zg.destroyLocalStream(this.publishStreamSrc)
            this.publishStreamSrc = ''
            this.isPublish = false
            console.log('停止推流')
        },
        async playStream() {
            this.remoteStream = await this.zg.startPlayingStream(this.streamId)
            this.isPlay = true
        },
        async stopPlayStream() {
            await this.zg.stopPlayingStream(this.streamId)
            this.isPlay = false
        }
    },
    mounted() {
        this.initZEGO()
        // this.publishStream()
        // this.zg.logout()
    }
}
</script>

<style lang='scss' scoped>
.main-wrap {
    width: 100%;
    height: 500px;
    background-color: #dfdfdf;
    video{
        width: 60px;
        height: 60px;
    }
}
</style>
