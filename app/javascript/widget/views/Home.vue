<script>
import { mapGetters } from 'vuex';
import { useRouter } from 'vue-router';
import configMixin from 'widget/mixins/configMixin';
import ChatFooter from 'widget/components/ChatFooter.vue';
import HazirSorular from 'widget/components/HazirSorular.vue';
import ArticleContainer from '../components/pageComponents/Home/Article/ArticleContainer.vue';

/**
 * Acilis ekrani.
 *
 * Chatwoot'un kendi tasariminda burada yalnizca bir karsilama basligi, koca
 * bir bosluk ve en altta "Gorusmeyi Baslatin" dugmesi vardi: yazmak icin
 * fazladan bir tiklama gerekiyordu ve ekranin ucte ikisi bostu.
 *
 * Chativo surumunde yazi alani acilista da en altta duruyor - sohbet
 * ekranindakiyle ayni yerde - yani ziyaretci widget'i acar acmaz yaziyor.
 * Ortadaki bosluk hazir sorularla doluyor.
 *
 * On sohbet formu acik olan hesaplarda mesaj dogrudan gonderilemez; o
 * durumda hem yazi alani hem hazir sorular forma goturuyor.
 */
export default {
  name: 'Home',
  components: {
    ArticleContainer,
    ChatFooter,
    HazirSorular,
  },
  mixins: [configMixin],
  setup() {
    const router = useRouter();
    return { router };
  },
  computed: {
    ...mapGetters({
      appConfig: 'appConfig/getAppConfig',
      conversationSize: 'conversation/getConversationSize',
      hazirSorular: 'appConfig/getHazirSorular',
    }),
    karsilamaBasligi() {
      return this.appConfig.welcomeTitle || this.channelConfig.welcomeTitle;
    },
    karsilamaMetni() {
      return (
        this.appConfig.welcomeDescription || this.channelConfig.welcomeTagline
      );
    },
    /**
     * On sohbet formu acikken ve henuz konusma yokken mesaj gonderilemez:
     * once ziyaretcinin adi/e-postasi isteniyor.
     */
    formaGitmeliMi() {
      return this.preChatFormEnabled && !this.conversationSize;
    },
  },
  watch: {
    /**
     * Ilk mesaj gidince sohbet ekranina geciyoruz. Yonlendirmeyi tek yerde
     * tutmak icin mesajin nereden geldigine bakmiyoruz: yazi alani da hazir
     * soru da ayni sayaci artiriyor.
     */
    conversationSize(yeniBoyut) {
      if (yeniBoyut > 0 && this.$route.name === 'home') {
        this.router.replace({ name: 'messages' });
      }
    },
  },
  methods: {
    soruyuGonder(soru) {
      if (this.formaGitmeliMi) {
        return this.router.replace({ name: 'prechat-form' });
      }
      return this.$store.dispatch('conversation/sendMessage', {
        content: soru,
      });
    },
    yaziAlaninaTiklandi() {
      if (this.formaGitmeliMi) {
        this.router.replace({ name: 'prechat-form' });
      }
    },
  },
};
</script>

<template>
  <div class="flex flex-col flex-1 w-full overflow-hidden">
    <div class="flex flex-col flex-1 gap-6 px-5 pt-1 pb-4 overflow-auto">
      <div v-if="karsilamaBasligi || karsilamaMetni">
        <h1
          v-if="karsilamaBasligi"
          v-dompurify-html="karsilamaBasligi"
          class="text-xl font-semibold leading-tight tracking-tight text-n-slate-12"
        />
        <p
          v-if="karsilamaMetni"
          v-dompurify-html="karsilamaMetni"
          class="mt-2 text-sm leading-relaxed text-n-slate-11"
        />
      </div>

      <HazirSorular
        v-if="hazirSorular.length"
        :sorular="hazirSorular"
        @sor="soruyuGonder"
      />

      <ArticleContainer />
    </div>

    <ChatFooter class="px-5" @click="yaziAlaninaTiklandi" />
  </div>
</template>
