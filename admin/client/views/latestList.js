'use strict';

import React from 'react';
import update from 'react/lib/update';
import xhr from 'xhr';
import async from 'async';
import CurrentListStore from '../stores/CurrentListStore';
import CreateLatestModal from '../components/CreateLatestModal';
import { LatestDndContainer } from './latestDndContainer';
import FlashMessages from '../components/FlashMessages';
import Footer from '../components/Footer';
import MobileNavigation from '../components/MobileNavigation';
import PrimaryNavigation from '../components/PrimaryNavigation';
import SecondaryNavigation from '../components/SecondaryNavigation';
import { BlankState, Button, Container, InputGroup, Spinner } from 'elemental';
import { plural } from '../utils';

const latestColumnContainerStyle = {
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  paddingBottom: '10px',
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
};

const latestColumnTextStyle = {
  color: '#999',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const latestColumns = [
  {
    name: '最新',
    style: {
      width: '500px',
      ...latestColumnTextStyle
    }
  }, {
    name: '文章數量',
    style: {
      ...latestColumnTextStyle
    }
  }, {
    name: '最新文章日期',
    style: {
      width: '280px',
      ...latestColumnTextStyle
    }
  }
];

const LatestListView = React.createClass({
  getInitialState() {
    return {
      latests: [],
      isReady: false,
      constrainTableWidth: true,
      isCreateModalOpen: window.location.search === '?create' || Keystone.createFormErrors,
      ...this.getStateFromStore(),
    };
  },
  componentDidMount() {
    this.updateLatestsState();
  },
  updateLatestsState() {
    this.loadLatestsInfo().then(latests => {
      this.setState({ latests: latests, isReady: true });
    }, err => {
      this.setState({ latests: [], isReady: true });
    });
  },
  loadLatestsInfo() {
    return new Promise((resolve, reject) => {
      // Get tags that latest_order > 0 & sorted with latest_order incrementally
      const filters = 'filters=' + encodeURIComponent('{"latest_order":{"mode":"gt","value":0}}') + '&sort=latest_order';
      xhr({
        url: Keystone.adminPath + '/api/tags?' + filters,
        responseType: 'json',
      }, (err, resp, data) => {
        if (err) {
          return reject(new Error(`Error loading items: ${err}`));
        }
        if (!data || !data.results) {
          return reject(new Error('Empty query result!'));
        }
        async.map(data.results, (tag, done) => {
          if (tag && tag.id) {
            // Get # of posts, newest post date of tag
            const filters = 'filters=' + encodeURIComponent(`{"tags":{"inverted":false,"value":["${tag.id}"]}}`) + '&select=title,name,state,publishedDate&limit=1&sort=-publishedDate';
            xhr({
              url: Keystone.adminPath + '/api/posts?' + filters,
              responseType: 'json',
            }, (err, resp, data) => {
              if (err) return done(err);
              if (!data) return done(new Error('Empty data!'));
              let count = 0;
              let newestDate;
              if (data.count > 0 && Array.isArray(data.results) && data.results.length > 0) {
                count = data.count;
                newestDate = data.results[0].fields.publishedDate;
              }
              done(null, {
                id: tag.id,
                name: tag.name,
                numPost: count,
                newestDate: newestDate
              });
            });
          }
        }, (err, latests) => {
          if (err) return reject(new Error('Fail to load # of posts/newest post date!'));
          resolve(latests);
        });
      });
    });
  },
  updateLatestOrder(id, latestOrder) {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append('action', 'updateItem');
      formData.append('latest_order', latestOrder);
      xhr({
        url: Keystone.adminPath + `/api/tags/${id}`,
        method: 'POST',
        headers: Keystone.csrf.header,
        body: formData,
      }, (err, resp, body) => {
        if (err) return reject(err);
        resolve('Success');
      });
    });
  },
  onLatestDrag(dragIndex, hoverIndex) {
    const { latests } = this.state;
    if (!latests || !Array.isArray(latests) || latests.length <= 0 || dragIndex < 0 || dragIndex >= latests.length || hoverIndex < 0 || hoverIndex >= latests.length) {
      return;
    }
    const dragLatest = latests[dragIndex];
    this.setState(
      update(this.state, {
        latests: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragLatest]
          ]
        }
      }), () => {
        async.forEachOf(this.state.latests, (latest, index) => {
          this.updateLatestOrder(latest.id, index + 1);
        }, err => {
          console.error('Update latests failed: ', err);
        });
      });
  },
  onLatestRemove(id) {
    const { latests } = this.state;
    if (!latests || !Array.isArray(latests) || latests.length <= 0) {
      return;
    }
    this.updateLatestOrder(id, 0).then(resolved => {
      this.setState({ latests: latests.filter(latest => latest && latest.id !== id) });
    }, err => {
      console.error('Remove latest failed: ', err);
    });
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
    const createButtonText = 'Add tag';
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
            {`${plural(this.state.latests.length, ('* ' + list.singular), ('* ' + list.plural))} sorted by 最新`}
          </h2>
          <InputGroup className="ListHeader__bar">
            <InputGroup.Section className="ListHeader__expand">
              <Button isActive={!this.state.constrainTableWidth} onClick={this.toggleTableWidth} title="Expand table width">
                <span className="octicon octicon-mirror" />
              </Button>
            </InputGroup.Section>
            {this.renderCreateButton()}
          </InputGroup>
          <div style={{ height: 34, marginBottom: '2em' }}>
            <span style={{ clear: 'both', display: 'table' }} />
          </div>
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
  renderActiveState() {
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
          <FlashMessages messages={this.props.messages} />
          <div style={latestColumnContainerStyle}>
            {latestColumns.map((column, index) => {
              return <span style={column.style} key={`column-${index}`}>{column.name}</span>;
            })}
          </div>
          <LatestDndContainer latests={this.state.latests} onLatestDrag={this.onLatestDrag} onLatestRemove={this.onLatestRemove} />
          {this.state.latests && this.state.latests.length === 0
            && <BlankState style={{ marginTop: 20, marginBottom: 20 }}>
              <span className="octicon octicon-search" style={{ fontSize: 32, marginBottom: 20 }} />
              <BlankState.Heading>Empty latests.</BlankState.Heading>
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
          {this.renderActiveState()}
        </div>
        <Footer
          appversion={this.props.appversion}
          backUrl={this.props.backUrl}
          brand={this.props.brand}
          User={this.props.User}
          user={this.props.user}
          version={this.props.version} />
        <CreateLatestModal
          err={this.props.createFormErrors}
          isOpen={this.state.isCreateModalOpen}
          list={this.state.list}
          onCancel={() => this.toggleCreateModal(false)}
          values={this.props.createFormData}
        />
      </div>
    );
  },
});

module.exports = LatestListView;
