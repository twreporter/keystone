'use strict';

import React from 'react';
import update from 'react/lib/update';
import xhr from 'xhr';
import async from 'async';
import CurrentListStore from '../stores/CurrentListStore';
import CreateReviewModal from '../components/CreateReviewModal';
import ReviewDndContainer from './reviewDndContainer';
import FlashMessages from '../components/FlashMessages';
import Footer from '../components/Footer';
import MobileNavigation from '../components/MobileNavigation';
import PrimaryNavigation from '../components/PrimaryNavigation';
import SecondaryNavigation from '../components/SecondaryNavigation';
import { BlankState, Button, Container, InputGroup, ResponsiveText, Spinner } from 'elemental';
import { plural } from '../utils';

const latestSavePanelStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginBottom: '32px',
};

const latestColumnContainerStyle = {
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  paddingBottom: '10px',
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingLeft: '68px',
};

const columnTextStyle = {
  color: '#999',
  overflow: 'hidden',
  whiteSpace: 'no-wrap',
  textOverflow: 'ellipsis',
};

const reviewColumns = [
  {
    name: '文章標題',
    style: {
      flex: 2,
      ...columnTextStyle
    }
  }, {
    name: '回顧說明',
    style: {
      flex: 1,
      ...columnTextStyle
    }
  }, {
    name: '發布日期',
    style: {
      width: '160px',
      ...columnTextStyle
    }
  }
];

const ReviewListView = React.createClass({
  getInitialState() {
    return {
      prevReviews: [],
      reviews: [],
      isDirty: false,
      isReady: false,
      messages: {},
      constrainTableWidth: true,
      isCreateModalOpen: window.location.search === '?create' || Keystone.createFormErrors,
      ...this.getStateFromStore(),
    };
  },
  componentDidMount() {
    this.updateReviewsState();
  },
  updateReviewsState() {
    this.loadReviews().then(reviews => {
      this.setState({
        prevReviews: [...reviews],
        reviews: [...reviews],
        isReady: true
      });
    }, err => {
      this.setState({ prevReviews: [], reviews: [], isReady: true });
    });
  },
  loadReviews() {
    return new Promise((resolve, reject) => {
      const order = 'sort=order';
      xhr({
        url: Keystone.adminPath + '/api/reviews?' + order,
        responseType: 'json',
      }, (err, resp, data) => {
        if (err) {
          return reject(new Error(`Error loading items: ${err}`));
        }
        if (!data || !data.results) {
          return reject(new Error('Empty query result!'));
        }
        const callback = (err, reviews) => {
          if (err) return reject(new Error('Fail to load info of reviews!'));
          resolve(reviews);
        };
        this.loadReviewInfo(data.results, callback);
      });
    });
  },
  loadReviewInfo(reviews, callback) {
    async.map(reviews, (review, done) => {
      if (review && review.fields && review.fields.post_id) {
        const select = '?select=title,reviewWord,publishedDate';
        xhr({
          url: Keystone.adminPath + '/api/posts/' + review.fields.post_id + select,
          responseType: 'json',
        }, (err, resp, data) => {
          if (err) return done(err);
          if (!data) return done(new Error('Empty data!'));
          done(null, {
            id: review.id,
            post_id: data.id,
            title: data.fields.title,
            publishedDate: data.fields.publishedDate,
            reviewWord: data.fields.reviewWord,
          });
        });
      }
    }, callback);
  },
  updateReview(id, { postId, order }) {
    const isCreate = !id;
    const action = isCreate ? 'create' : 'updateItem';
    const path = isCreate ? '/api/reviews/create' : `/api/reviews/${id}`;

    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append('action', action);
      formData.append('order', order);
      formData.append('post_id', postId);
      xhr({
        url: Keystone.adminPath + path,
        method: 'POST',
        headers: Keystone.csrf.header,
        body: formData,
        responseType: 'json',
      }, (err, resp, body) => {
        if (err) return reject(err);
        const addReview = { id: body.id, post_id: body.fields.post_id };
        this.onUpdateReviewSuccess(addReview);
        resolve(addReview);
      });
    });
  },
  onUpdateReviewSuccess(review) {
    const reviews = this.state.reviews;
    const index = reviews.findIndex(item => item.post_id === review.post_id);
    if (index < 0) {
      return;
    }
    reviews[index].id = review.id;
    this.setState({ reviews });
  },
  deleteReview(reviewId) {
    if (!reviewId) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append('action', 'delete');
      xhr({
        url: Keystone.adminPath + `/api/reviews/${reviewId}/delete`,
        method: 'POST',
        headers: Keystone.csrf.header,
        body: formData,
      }, (err, resp, body) => {
        if (err) return reject(err);
        this.onDeleteReviewSuccess(reviewId);
        resolve('Success');
      });
    });
  },
  onDeleteReviewSuccess(reviewId) {
    const reviews = this.state.reviews;
    const index = reviews.findIndex(item => item.id === reviewId);
    if (index < 0) {
      return;
    }
    reviews.splice(index, 1);
    this.setState({ reviews });
  },
  onPostAdd(newPosts) {
    if (Array.isArray(newPosts) && newPosts.length > 0) {
      this.loadReviewInfo(newPosts.map(post => ({ fields: { post_id: post.id } })), (err, reviews) => {
        if (err) {
          console.error('Load newly added review info failed!');
          this.setState({ messages: { error: ['Load newly added review info failed!'] } });
          return;
        }
        this.setState({ reviews: [...reviews, ...this.state.reviews], isDirty: true });
      });
    }
    this.toggleCreateModal(false);
  },
  onReviewDrag(dragIndex, hoverIndex) {
    const { reviews } = this.state;
    if (!reviews || !Array.isArray(reviews) || reviews.length <= 0 || dragIndex < 0 || dragIndex >= reviews.length || hoverIndex < 0 || hoverIndex >= reviews.length) {
      return;
    }
    const dragReview = reviews[dragIndex];
    this.setState(
      update(this.state, {
        reviews: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragReview]
          ]
        }
      }));
    this.setState({ isDirty: true });
  },
  onReviewRemove(id) {
    const { reviews } = this.state;
    if (Array.isArray(reviews) && reviews.length > 0) {
      this.setState({ reviews: reviews.filter(review => review && review.id !== id), isDirty: true });
    }
  },
  onSave() {
    const { prevReviews, reviews } = this.state;
    const deleteReviews = prevReviews.filter(item => !reviews.some(review => review.id === item.id));
    const date = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });

    // delete reviews
    async.each(deleteReviews, (item, callback) => {
      this.deleteReview(item.id).then(success => callback()).catch(err => callback(err));
    }, err => {
      if (err) {
        console.error('Reset reviews failed!', err);
        this.setState({ messages: { error: [`Reset reviews failed! ${date}`] } });
        return;
      };

      // create or update reviews
      async.forEachOf(reviews, (review, index, callback) => {
        this.updateReview(review.id, { postId: review.post_id, order: index + 1 }).then(success => callback()).catch(err => callback(err));
      }, err => {
        if (err) {
          console.error('Update reviews failed!', err);
          this.setState({ messages: { error: [`Update reviews failed! ${date}`] } });
          return;
        }
        this.setState({
          prevReviews: [...reviews],
          isDirty: false,
          messages: { success: [`Update reviews successfully. ${date}`] },
        });
      });
    });
  },
  onResetChange() {
    this.setState({ reviews: [...this.state.prevReviews], isDirty: false });
  },
  getStateFromStore() {
    return { list: CurrentListStore.getList() };
  },
  renderCreateButton() {
    if (this.state.list.nocreate) return null;
    var props = { type: 'success' };
    if (this.state.list.autocreate) {
      props.href = '?new' + Keystone.csrf.query;
    } else {
      props.onClick = () => this.toggleCreateModal(true);
    }
    const createButtonText = 'Add Posts';
    return (
      <InputGroup.Section className="ListHeader__create">
        <Button {...props} title={createButtonText}>
          <span className="ListHeader__create__icon octicon octicon-plus" />
          <span className="ListHeader__create__label">{createButtonText}</span>
          <span className="ListHeader__create__label--lg">{createButtonText}</span>
        </Button>
      </InputGroup.Section>
    );
  },
  renderHeader() {
    let { list } = this.state;
    return (
      <div className="ListHeader">
        <Container>
          <h2 className="ListHeader__title">
            {`${plural(this.state.reviews.length, ('* ' + list.singular), ('* ' + list.plural))} sorted by 顯示順序`}
          </h2>
          <InputGroup className="ListHeader__bar" style={{ justifyContent: 'flex-end' }}>
            <InputGroup.Section className="ListHeader__expand">
              <Button isActive={!this.state.constrainTableWidth} onClick={this.toggleTableWidth} title="Expand table width">
                <span className="octicon octicon-mirror" />
              </Button>
            </InputGroup.Section>
            {this.renderCreateButton()}
          </InputGroup>
        </Container>
      </div>
    );
  },
  toggleTableWidth() {
    this.setState({ constrainTableWidth: !this.state.constrainTableWidth });
  },
  toggleCreateModal(visible) {
    this.setState({ isCreateModalOpen: visible });
  },
  renderReviewComponent() {
    let containerStyle = {
      transition: 'max-width 160ms ease-out',
      msTransition: 'max-width 160ms ease-out',
      MozTransition: 'max-width 160ms ease-out',
      WebkitTransition: 'max-width 160ms ease-out',
    };
    if (!this.state.constrainTableWidth) {
      containerStyle.maxWidth = '100%';
    }
    return (
      <div>
        {this.renderHeader()}
        <Container style={containerStyle}>
          <div style={{ height: 64 }}>
            <FlashMessages messages={this.state.messages} />
          </div>
          <div style={latestSavePanelStyle}>
            <Button key="reset" type="link-cancel" disabled={!this.state.isDirty} onClick={this.onResetChange}>
              <ResponsiveText hiddenXS="reset changes" visibleXS="reset" />
            </Button>
            <Button key="save" type="primary" disabled={!this.state.isDirty} onClick={this.onSave}>Save</Button>
          </div>
          <div style={latestColumnContainerStyle}>
            {reviewColumns.map((column, index) => {
              return <span style={column.style} key={`column-${index}`}>{column.name}</span>;
            })}
          </div>
          <ReviewDndContainer reviews={this.state.reviews} onDrag={this.onReviewDrag} onRemove={this.onReviewRemove} />
          {this.state.reviews && this.state.reviews.length === 0
            && <BlankState style={{ marginTop: 20, marginBottom: 20 }}>
              <span className="octicon octicon-search" style={{ fontSize: 32, marginBottom: 20 }} />
              <BlankState.Heading>Empty reviews.</BlankState.Heading>
            </BlankState>
          }
        </Container>
      </div>
    );
  },
  render() {
    return !this.state.isReady ? (
      <div className="view-loading-indicator"><Spinner size="md" /></div>
    ) : (
      <div className="keystone-wrapper">
        <header className="keystone-header">
          <MobileNavigation
            brand={this.props.brand}
            currentListKey={this.state.list.path}
            currentSectionKey={this.props.nav.currentSection.key}
            sections={this.props.nav.sections}
            signoutUrl={this.props.signoutUrl}
          />
          <PrimaryNavigation
            brand={this.props.brand}
            currentSectionKey={this.props.nav.currentSection.key}
            sections={this.props.nav.sections}
            signoutUrl={this.props.signoutUrl} />
          <SecondaryNavigation
            currentListKey={this.state.list.path}
            lists={this.props.nav.currentSection.lists} />
        </header>
        <div className="keystone-body">
          {this.renderReviewComponent()}
        </div>
        <Footer
          appversion={this.props.appversion}
          backUrl={this.props.backUrl}
          brand={this.props.brand}
          User={this.props.User}
          user={this.props.user}
          version={this.props.version} />
        <CreateReviewModal
          err={this.props.createFormErrors}
          isOpen={this.state.isCreateModalOpen}
          list={this.state.list}
          onReviewsAdd={this.onPostAdd}
          onCancel={() => this.toggleCreateModal(false)}
          values={this.state.reviews}
        />
      </div>
    );
  },
});

module.exports = ReviewListView;
