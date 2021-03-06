<template>
  <div class="comment-list">
    <!-- loading animation when first time loading -->
    <div class="comment-list__loading" v-if="isLoadingFirst">
      <LoadingIcon />
    </div>
    <div class="comment-list__comments" v-else>
      <CommentReplyEditor
        isMain
        :id="id"
        :type="type"
        @sentComment="handleSentComment"
      />
      <div v-if="hotComments.length">
        <h3>最热评论（{{ hotComments.length }}）</h3>
        <CommentItem
          v-for="comment in hotComments"
          :key="comment.commentId"
          :comment="comment"
          :id="id"
          :type="type"
          @sentComment="handleSentComment"
          @deleteComment="handleDeleteComment"
        />
      </div>
      <div v-if="comments.length">
        <h3>最新评论（{{ comments.length }}）</h3>
        <CommentItem
          v-for="comment in comments"
          :key="comment.commentId"
          :comment="comment"
          :id="id"
          :type="type"
          @sentComment="handleSentComment"
          @deleteComment="handleDeleteComment"
        />
      </div>
      <!-- loading animation when loading more comments -->
      <div class="comment-list__loading" v-if="isLoadingMore">
        <LoadingIcon />
      </div>
      <!-- loaded all comments Sign board -->
      <div class="comment-list__loaded-all" v-if="isAllCommentsLoaded">
        <span class="comment-list__loaded-all__title">已加载完所有评论</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { formatDay, isUndef } from "@/utilitys";
import LikeIcon from "@/components/SVGIcons/LikeIcon.vue";
import RightArrowIcon from "@/components/SVGIcons/RightArrowIcon.vue";
import CommentItem from "./CommentItem.vue";
import CommentReplyEditor from "./CommentReplyEditor.vue";
import {
  getSongComment,
  getMVComments,
  getPlaylistComments,
  getAlbumComments
} from "@/service";
import LoadingIcon from "@/components/globals/Loading.vue";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { Comment, CommentType } from "@/types";
import { Mutation, namespace, State } from "vuex-class";

const notification = namespace("notification");
const mainScroll = namespace("mainScroll");
@Component({
  components: { CommentItem, CommentReplyEditor, LoadingIcon }
})
export default class CommentList extends Vue {
  comments: Comment[] = [];

  hotComments: Comment[] = [];

  more: boolean = false;

  moreHot: boolean = false;

  isLoadingFirst: boolean = true;

  isLoadingMore: boolean = false;

  total: number = 0;
  offset: number = 0;

  @Prop() type!: CommentType;

  @Prop(Number) id!: number;
  @notification.Mutation setMsg!: (msg: string) => void;
  @mainScroll.State isBottom!: boolean;

  created() {
    this.isLoadingFirst = true;
    this.updateData(() => (this.isLoadingFirst = false));
  }

  get serviceApi() {
    let service;
    switch (this.type) {
      case CommentType.MvComment:
        service = getMVComments;
        break;
      case CommentType.SongComment:
        service = getSongComment;
        break;
      case CommentType.PlaylistComment:
        service = getPlaylistComments;
        break;
      case CommentType.AlbumComment:
        service = getAlbumComments;
        break;
      default:
        return null;
    }
    return service;
  }

  get isAllCommentsLoaded() {
    return !this.more;
  }
  handleSentComment(comment: Comment) {
    this.comments.unshift(comment);
  }
  handleDeleteComment(comment: Comment) {
    this.comments = this.comments.filter(
      (c: Comment): boolean => c.commentId !== comment.commentId
    );
  }
  @Watch("isBottom")
  onisScrollBottomChange(val: boolean) {
    if (val === true) {
      this.loadingMoreComments();
    }
  }
  updateData(cb?: () => {}) {
    if (isUndef(this.type) || isUndef(this.id)) {
      return;
    }
    if (!this.serviceApi) {
      cb && cb();
      return;
    }

    this.serviceApi(this.id, this.offset).then(
      ({ data: { hotComments, comments, more, moreHot, total } }) => {
        if (hotComments && hotComments.length > 0) {
          hotComments.forEach((c: Comment) => {
            if (
              this.hotComments.findIndex(
                (oldc: Comment): boolean => oldc.commentId === c.commentId
              ) < 0
            ) {
              this.hotComments.push(c);
            }
          });
        }
        if (comments && comments.length > 0) {
          comments.forEach((c: Comment) => {
            if (
              this.comments.findIndex(
                (oldc: Comment): boolean => oldc.commentId === c.commentId
              ) < 0
            ) {
              this.comments.push(c);
            }
          });
          this.offset = this.comments.length;
        }
        this.more = more;
        this.moreHot = moreHot;
        this.total = total;
        cb && cb();
      },
      error => {
        cb && cb();
        this.setMsg(`获取评论错误${error && error.msg}！`);
      }
    );
  }

  loadingMoreComments() {
    if (this.isAllCommentsLoaded) {
      return;
    }
    if (this.isLoadingMore) {
      return;
    }
    if (!this.serviceApi) return;
    this.isLoadingMore = true;
    this.updateData(() => (this.isLoadingMore = false));
  }
}
</script>
<style lang="sass" scoped>
@import "@/style/theme.sass"

.comment-list
  &__loading
    height: 2em
    width: 2em
    margin: 3em auto 0
  &__comments
    margin-top: 1.5em
  &__loaded-all
    margin: 3em auto
    text-align: center
    &__title
      display: inline-block
      border: 1px solid
      padding: 0.2em 1em
      border-radius: 9999px
      font-size: 12px
      @include themify($themes)
        color: themed('secondary-text-color')
        border-color: themed('secondary-border-color')
</style>
