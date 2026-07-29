<script setup>
import { computed, ref, watch } from 'vue';
import { getLastMessage } from 'dashboard/helper/conversationHelper';
import Avatar from 'next/avatar/Avatar.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';
import MessagePreview from './MessagePreview.vue';
import ChannelIcon from 'dashboard/components-next/icon/ChannelIcon.vue';
import TimeAgo from 'dashboard/components/ui/TimeAgo.vue';
import CardLabels from './conversationCardComponents/CardLabels.vue';
import CardPriorityIcon from 'dashboard/components-next/Conversation/ConversationCard/CardPriorityIcon.vue';
import UnreadBadge from 'dashboard/components-next/Conversation/ConversationCard/UnreadBadge.vue';
import SLACardLabel from './components/SLACardLabel.vue';
import VoiceCallStatus from './VoiceCallStatus.vue';
import Checkbox from 'dashboard/components-next/checkbox/Checkbox.vue';

const props = defineProps({
  chat: { type: Object, required: true },
  currentContact: { type: Object, required: true },
  assignee: { type: Object, default: () => ({}) },
  inbox: { type: Object, default: () => ({}) },
  selected: { type: Boolean, default: false },
  isActiveChat: { type: Boolean, default: false },
  showAssignee: { type: Boolean, default: false },
  showInboxName: { type: Boolean, default: false },
  hideThumbnail: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
});

const emit = defineEmits([
  'click',
  'contextmenu',
  'selectConversation',
  'deSelectConversation',
]);

const hovered = ref(false);

const unreadCount = computed(() => props.chat.unread_count);
const hasUnread = computed(() => unreadCount.value > 0);
const lastMessageInChat = computed(() => getLastMessage(props.chat));

const voiceCallData = computed(() => {
  const last = lastMessageInChat.value;
  if (last?.content_type !== 'voice_call' || !last.call) {
    return { status: null, direction: null };
  }
  return {
    status: last.call.status,
    direction: last.call.direction === 'outgoing' ? 'outbound' : 'inbound',
  };
});

const isAgentBotAssignee = computed(
  () => props.chat?.meta?.assignee_type === 'AgentBot'
);

const hasSlaPolicyId = computed(
  () => props.chat?.applied_sla?.id && !props.currentContact?.blocked
);

const showLabelsSection = computed(() => {
  return props.chat.labels?.length > 0 || hasSlaPolicyId.value;
});

// Etiket satiri ayni zamanda atanan temsilciyi tasiyor: ikisi de ikincil bilgi,
// ayri satir acmalarina gerek yok.
const showAssigneeChip = computed(
  () => props.showAssignee && !!props.assignee.name
);

const showFooterSection = computed(
  () => showLabelsSection.value || showAssigneeChip.value
);

const messagePreviewClass = computed(() =>
  hasUnread.value ? 'font-medium text-n-slate-12' : 'text-n-slate-11'
);

const onThumbnailHover = () => {
  hovered.value = !props.hideThumbnail;
};

const onThumbnailLeave = () => {
  hovered.value = false;
};

const onSelectConversation = checked => {
  if (checked) {
    emit('selectConversation', props.chat.id, props.inbox.id);
  } else {
    emit('deSelectConversation', props.chat.id, props.inbox.id);
  }
};

const selectedModel = computed({
  get: () => props.selected,
  set: value => onSelectConversation(value),
});

watch(
  () => props.chat.id,
  () => {
    hovered.value = false;
  }
);
</script>

<template>
  <div
    class="relative flex items-start flex-grow-0 flex-shrink-0 w-auto max-w-full gap-2.5 py-3 cursor-pointer conversation border-b border-n-weak hover:bg-n-alpha-1 dark:hover:bg-n-alpha-3 group before:absolute before:inset-y-0 before:w-0.5 ltr:before:left-0 rtl:before:right-0 before:bg-transparent"
    :class="{
      'active animate-card-select bg-n-alpha-2 before:!bg-n-brand': isActiveChat,
      'selected bg-n-alpha-1': selected,
      'px-2': compact,
      'px-3': !compact,
    }"
    @click="$emit('click', $event)"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <div
      class="relative"
      @mouseenter="onThumbnailHover"
      @mouseleave="onThumbnailLeave"
    >
      <Avatar
        v-if="!hideThumbnail"
        :name="currentContact.name"
        :src="currentContact.thumbnail"
        :size="32"
        :status="currentContact.availability_status"
        class="mt-0.5"
        hide-offline-status
      >
        <template #overlay="{ size }">
          <label
            v-if="hovered || selected"
            class="flex items-center justify-center rounded-full cursor-pointer absolute inset-0 z-10 backdrop-blur-[2px]"
            :style="{ width: `${size}px`, height: `${size}px` }"
            @click.stop
          >
            <Checkbox v-model="selectedModel" />
          </label>
        </template>
      </Avatar>
    </div>
    <div class="flex flex-col flex-1 min-w-0 gap-1">
      <div class="flex items-center min-w-0 gap-2">
        <h4
          class="conversation--user text-sm m-0 capitalize truncate min-w-0 text-n-slate-12"
          :class="hasUnread ? 'font-semibold' : 'font-medium'"
        >
          {{ currentContact.name }}
        </h4>
        <ChannelIcon
          v-if="showInboxName"
          v-tooltip.right="inbox.name"
          :inbox="inbox"
          class="flex-shrink-0 size-3.5 text-n-slate-10"
        />
        <CardPriorityIcon
          :priority="chat.priority"
          class="flex-shrink-0 !size-3.5"
        />
        <TimeAgo
          class="flex-shrink-0"
          :last-activity-timestamp="chat.timestamp"
          :created-at-timestamp="chat.created_at"
          :conversation-id="chat.id"
        />
      </div>
      <div class="flex items-center min-w-0 gap-2">
        <VoiceCallStatus
          v-if="voiceCallData.status"
          key="voice-status-row"
          :status="voiceCallData.status"
          :direction="voiceCallData.direction"
          :message-preview-class="messagePreviewClass"
          class="flex-1 min-w-0"
        />
        <MessagePreview
          v-else-if="lastMessageInChat"
          key="message-preview"
          :message="lastMessageInChat"
          class="flex-1 min-w-0 m-0 text-sm leading-5"
          :class="messagePreviewClass"
        />
        <p
          v-else
          key="no-messages"
          class="flex-1 min-w-0 m-0 overflow-hidden text-sm leading-5 text-n-slate-11 text-ellipsis whitespace-nowrap"
        >
          {{ $t(`CHAT_LIST.NO_MESSAGES`) }}
        </p>
        <UnreadBadge v-if="hasUnread" :count="unreadCount" class="flex-shrink-0" />
      </div>
      <div v-if="showFooterSection" class="flex items-center min-w-0 gap-2">
        <CardLabels
          v-if="showLabelsSection"
          :conversation-labels="chat.labels"
          class="min-w-0 m-0"
        >
          <template v-if="hasSlaPolicyId" #before>
            <SLACardLabel :chat="chat" class="ltr:mr-1 rtl:ml-1" />
          </template>
        </CardLabels>
        <span
          v-if="showAssigneeChip"
          class="inline-flex items-center flex-shrink-0 gap-1 ltr:ml-auto rtl:mr-auto text-xs truncate text-n-slate-11"
        >
          <Icon
            :icon="isAgentBotAssignee ? 'i-lucide-bot' : 'i-lucide-user-round'"
            class="flex-shrink-0 size-3 text-n-slate-10"
          />
          <span class="truncate">{{ assignee.name }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
