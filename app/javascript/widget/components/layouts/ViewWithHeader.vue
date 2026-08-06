<script>
import Banner from '../Banner.vue';
import Branding from 'shared/components/Branding.vue';
import ChatHeader from '../ChatHeader.vue';
import configMixin from '../../mixins/configMixin';
import { mapGetters } from 'vuex';
import { IFrameHelper } from 'widget/helpers/utils';

export default {
  components: {
    Banner,
    Branding,
    ChatHeader,
  },
  mixins: [configMixin],
  data() {
    return {
      showPopoutButton: false,
      disableBranding: window.chatwootWebChannel.disableBranding || false,
    };
  },
  computed: {
    ...mapGetters({
      appConfig: 'appConfig/getAppConfig',
      availableAgents: 'agent/availableAgents',
    }),
    portal() {
      return window.chatwootWebChannel.portal;
    },
    showBackButton() {
      return ['article-viewer', 'messages', 'prechat-form'].includes(
        this.$route.name
      );
    },
    isOnArticleViewer() {
      return ['article-viewer'].includes(this.$route.name);
    },
  },
  methods: {
    closeWindow() {
      IFrameHelper.sendMessage({ event: 'closeWindow' });
    },
  },
};
</script>

<template>
  <div
    class="w-full h-full overflow-hidden bg-n-slate-2 dark:bg-n-solid-1"
    @keydown.esc="closeWindow"
  >
    <div class="relative flex flex-col h-full">
      <div
        class="collapsed shadow-[0_10px_15px_-16px_rgba(50,50,93,0.08),0_4px_6px_-8px_rgba(50,50,93,0.04)]"
      >
        <ChatHeader
          :title="channelConfig.websiteName"
          :avatar-url="channelConfig.avatarUrl"
          :show-popout-button="appConfig.showPopoutButton"
          :available-agents="availableAgents"
          :show-back-button="showBackButton"
        />
      </div>
      <Banner />
      <router-view />

      <Branding v-if="!isOnArticleViewer" :disable-branding="disableBranding" />
    </div>
  </div>
</template>
