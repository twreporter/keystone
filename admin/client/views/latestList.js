'use strict';

import React from 'react';
import update from 'react/lib/update';
import xhr from 'xhr';
import async from 'async';
import CurrentListStore from '../stores/CurrentListStore';
import ConfirmationDialog from '../components/ConfirmationDialog';
import CreateLatestForm from '../components/CreateLatestForm';
import { LatestDndContainer } from './latestDndContainer';
import FlashMessages from '../components/FlashMessages';
import Footer from '../components/Footer';
import MobileNavigation from '../components/MobileNavigation';
import PrimaryNavigation from '../components/PrimaryNavigation';
import SecondaryNavigation from '../components/SecondaryNavigation';
import { BlankState, Button, Container, InputGroup, Pagination, Spinner } from 'elemental';
import { plural } from '../utils';

const LatestListView = React.createClass({
  getInitialState() {
    return {
      latests: [],
      confirmationDialog: {
        isOpen: false,
      },
      checkedItems: {},
      constrainTableWidth: true,
      manageMode: false,
      searchString: '',
      showCreateForm: window.location.search === '?create' || Keystone.createFormErrors,
      showUpdateForm: false,
      ...this.getStateFromStore(),
    };
  },
  componentDidMount() {
    CurrentListStore.addChangeListener(this.updateStateFromStore);
    this.loadTagsInfo();
  },
  componentWillUnmount() {
    CurrentListStore.removeChangeListener(this.updateStateFromStore);
  },
  loadTagsInfo() {
    // Get tags that latest_order > 0
    const filters = 'filters=' + encodeURIComponent('{"latest_order":{"mode":"gt","value":0}}');
    xhr({
      url: Keystone.adminPath + '/api/tags?' + filters,
      responseType: 'json',
    }, (err, resp, data) => {
      if (err || !data || !data.results) {
        console.error('Error loading items:', err);
        return;
      }
      async.map(data.results, (tag, done) => {
        if (tag && tag.id) {
          // Get # of posts, newest post date of tag
          const filters = 'filters=' + encodeURIComponent(`{"tags":{"inverted":false,"value":["${tag.id}"]}}`) + '&select=title,name,state,publishedDate&limit=1&sort=-publishedDate';
          xhr({
            url: Keystone.adminPath + '/api/posts?' + filters,
            responseType: 'json',
          }, (err, resp, data) => {
            if (err || !data) return done(err);
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
      }, (err, results) => {
        if (err) {
          console.log(err);
        } else {
          this.setState({ latests: results });
        }
      });
    });
  },
  onLatestDrag(dragIndex, hoverIndex) {
    const { latests } = this.state;
    if (!Array.isArray(latests) || latests.length <= 0 || dragIndex < 0 || dragIndex >= latests.length || hoverIndex < 0 || hoverIndex >= latests.length) {
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
      })
    );
  },
  updateStateFromStore() {
    this.setState(this.getStateFromStore());
  },
  getStateFromStore() {
    var state = {
      columns: CurrentListStore.getActiveColumns(),
      currentPage: CurrentListStore.getCurrentPage(),
      filters: CurrentListStore.getActiveFilters(),
      items: CurrentListStore.getItems(),
      list: CurrentListStore.getList(),
      loading: CurrentListStore.isLoading(),
      pageSize: CurrentListStore.getPageSize(),
      ready: CurrentListStore.isReady(),
      search: CurrentListStore.getActiveSearch(),
      rowAlert: CurrentListStore.rowAlert(),
    };
    if (!this._searchTimeout) {
      state.searchString = state.search;
    }
    state.showBlankState = (state.ready && !state.loading && !state.items.results.length && !state.search && !state.filters.length);
    return state;
  },

  // ==============================
  // HEADER
  // ==============================

  handlePageSelect(i) {
    CurrentListStore.setCurrentPage(i);
  },
  toggleUpdateModal(filter = !this.state.showUpdateForm) {
    this.setState({
      showUpdateForm: filter,
    });
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
  renderConfirmationDialog() {
    const props = this.state.confirmationDialog;
    return (
      <ConfirmationDialog
        isOpen={props.isOpen}
        body={props.body}
        confirmationLabel={props.label}
        onCancel={this.removeConfirmationDialog}
        onConfirmation={props.onConfirmation}
      />
    );
  },
  renderPagination() {
    let { currentPage, items, list, manageMode, pageSize } = this.state;
    if (manageMode || !items.count) return;

    return (
      <Pagination
        className="ListHeader__pagination"
        currentPage={currentPage}
        onPageSelect={this.handlePageSelect}
        pageSize={pageSize}
        plural={list.plural}
        singular={list.singular}
        style={{ marginBottom: 0 }}
        total={items.count}
        limit={10}
      />
    );
  },
  renderHeader() {
    let { items, list } = this.state;
    return (
      <div className="ListHeader">
        <Container>
          <h2 className="ListHeader__title">
            {`${plural(items.count, ('* ' + list.singular), ('* ' + list.plural))} sorted by 最新`}
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
            {this.renderPagination()}
            <span style={{ clear: 'both', display: 'table' }} />
          </div>
        </Container>
      </div>
    );
  },

  // ==============================
  // TABLE
  // ==============================

  checkTableItem(item, e) {
    e.preventDefault();
    let newCheckedItems = { ...this.state.checkedItems };
    let itemId = item.id;
    if (this.state.checkedItems[itemId]) {
      delete newCheckedItems[itemId];
    } else {
      newCheckedItems[itemId] = true;
    }
    this.setState({
      checkedItems: newCheckedItems,
    });
  },
  checkAllTableItems() {
    let checkedItems = {};
    this.state.items.results.forEach(item => {
      checkedItems[item.id] = true;
    });
    this.setState({
      checkedItems: checkedItems,
    });
  },
  uncheckAllTableItems() {
    this.setState({
      checkedItems: {},
    });
  },
  deleteTableItem(item, e) {
    // TODO: delete operation
    console.log('delete', item.name);
  },
  removeConfirmationDialog() {
    this.setState({
      confirmationDialog: {
        isOpen: false,
      },
    });
  },
  toggleTableWidth() {
    this.setState({
      constrainTableWidth: !this.state.constrainTableWidth,
    });
  },

  // ==============================
  // COMMON
  // ==============================

  toggleCreateModal(visible) {
    this.setState({
      showCreateForm: visible,
    });
  },
  renderBlankStateCreateButton() {
    var props = { type: 'success' };
    if (this.state.list.nocreate) return null;
    if (this.state.list.autocreate) {
      props.href = '?new' + this.props.csrfQuery;
    } else {
      props.onClick = () => this.toggleCreateModal(true);
    }
    return (
      <Button {...props}>
        <span className="octicon octicon-plus" />
				Create {this.state.list.singular}
      </Button>
    );
  },
  renderBlankState() {
    if (!this.state.showBlankState) return null;
    return (
      <Container>
        <FlashMessages messages={this.props.messages} />
        <BlankState style={{ marginTop: 40 }}>
          <BlankState.Heading>No {this.state.list.plural.toLowerCase()} found&hellip;</BlankState.Heading>
          {this.renderBlankStateCreateButton()}
        </BlankState>
      </Container>
    );
  },
  renderActiveState() {
    if (this.state.showBlankState) return null;

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
          {this.state.columns.map((column, index) => { // TODO: style
            return <span key={`column-${index}`}>{column.label}</span>;
          })}
          <LatestDndContainer latests={this.state.latests} onLatestDrag={this.onLatestDrag} />
          {this.renderNoSearchResults()}
        </Container>
      </div>
    );
  },
  renderNoSearchResults() {
    if (this.state.items.results.length) return null;
    let matching = this.state.search;
    if (this.state.filters.length) {
      matching += (matching ? ' and ' : '') + plural(this.state.filters.length, '* filter', '* filters');
    }
    matching = matching ? ' found matching ' + matching : '.';
    return (
      <BlankState style={{ marginTop: 20, marginBottom: 20 }}>
        <span className="octicon octicon-search" style={{ fontSize: 32, marginBottom: 20 }} />
        <BlankState.Heading>No {this.state.list.plural.toLowerCase()}{matching}</BlankState.Heading>
      </BlankState>
    );
  },
  render() {
    return !this.state.ready ? (
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
          {this.renderBlankState()}
          {this.renderActiveState()}
        </div>
        <Footer
          appversion={this.props.appversion}
          backUrl={this.props.backUrl}
          brand={this.props.brand}
          User={this.props.User}
          user={this.props.user}
          version={this.props.version} />
        <CreateLatestForm
          err={this.props.createFormErrors}
          isOpen={this.state.showCreateForm}
          list={this.state.list}
          onCancel={() => this.toggleCreateModal(false)}
          values={this.props.createFormData}
        />
      </div>
    );
  },
});

module.exports = LatestListView;
