'use strict';
import { shallowEqual } from 'react-pure-render';
import { Button } from 'elemental';
import { ImageItem } from './ImageGrid';
import { Pill } from 'elemental';
import _ from 'lodash';
import raf from 'raf' // requestAnimationFrame polyfill
import Audio from 'react-howler';
import React from 'react';

class AudioItem extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            playing: false,
            loaded: false
        };
        this.handleToggle = this._handleToggle.bind(this);
        this.handleOnLoad = this._handleOnLoad.bind(this);
        this.handleOnEnd = this._handleOnEnd.bind(this);
        this.handleOnPlay = this._handleOnPlay.bind(this);
        this.renderSeekPos = this._renderSeekPos.bind(this);
    }

    componentWillUnmount () {
        this.clearRAF()
    }

    _handleToggle (e) {
        e.stopPropagation();
        this.setState({
            playing: !this.state.playing
        })
    }

    _handleOnLoad () {
        this.setState({
            loaded: true,
            duration: this.player.duration()
        })
    }

    _handleOnPlay () {
        this.setState({
            playing: true
        })
        this.renderSeekPos()
    }

    _handleOnEnd () {
        this.setState({
            playing: false
        })
        this.clearRAF()
    }

    _handleSelect(e) {
        e.stopPropagation();
        this.props.onSelect(e);
    }

    _renderSeekPos () {
        this.setState({
            seek: this.player.seek()
        })
        if (this.state.playing) {
            this._raf = raf(this.renderSeekPos)
        }
    }

    clearRAF () {
        raf.cancel(this._raf)
    }

    render () {
      const { audio, coverPhoto, doShowRemove, isSelected, title, description, width } = this.props;
      let image = _.get(coverPhoto, [ 'resizedTargets', 'desktop' ], {});

      let style = {
          border: isSelected ? '1px solid' : '',
          boxSizing: 'border-box',
          display: 'inline-block',
          padding: '10px',
          width: `${width}%`
      }
      return (
          <div onClick={this._handleSelect.bind(this)} style={style}>
              <ImageItem
                  doShowRemove={doShowRemove}
                  id={_.get(coverPhoto, 'id')}
                  url={_.get(image, 'url')}
                  width={100}
              />
              <Audio
                  src={audio}
                  playing={this.state.playing}
                  onLoad={this.handleOnLoad}
                  onPlay={this.handleOnPlay}
                  onEnd={this.handleOnEnd}
                  loop={this.state.loop}
                  mute={this.state.mute}
                  ref={(ref) => this.player = ref}
              />
              <h3>{title}</h3>
              <div dangerouslySetInnerHTML={{__html: description}} />
              <Button type="primary" onClick={this.handleToggle}>
                  {(this.state.playing) ? 'Pause' : 'Play' }
              </Button>
          </div>
      )
  }
}

AudioItem.propTypes = {
    audio: React.PropTypes.string,
    coverPhoto: React.PropTypes.object,
    description: React.PropTypes.string,
    doShowRemove: React.PropTypes.bool,
    isSelected: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    onRemove: React.PropTypes.func,
    title: React.PropTypes.string,
    width: React.PropTypes.number.isRequired
};

AudioItem.defaultProps = {
    audio: '',
    coverPhoto: null,
    description: '',
    doShowRemove: false,
    isSelected: false,
    title: '',
    width: 100
};

class AudioGrid extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            audios: props.audios,
            selectedAudios: props.selectedAudios
        };
    }
    componentWillReceiveProps (nextProps) {
        this.setState({
            audios: nextProps.audios,
            selectedAudios: nextProps.selectedAudios
        });
    }
    shouldComponentUpdate (nextProps, nextState) {
        return  !shallowEqual(this.props, nextProps) ||
            !shallowEqual(this.state, nextState);
    }

    _handleSelect (audio) {
        console.log('click audio:', audio);
        this.props.onSelect(audio);
    }

    render () {
        const { audios, selectedAudios } = this.state;
        const { columns, padding } = this.props;
        const width = Math.floor(100 / columns);
        const audioItems = audios.map((audio, index) => {
            const isSelected = selectedAudios.find((element) => {
                return element.id === audio.id;
            }) ? true : false;
            return (
                <AudioItem
                    audio={_.get(audio, 'url')}
                    coverPhoto={_.get(audio, 'coverPhoto')}
                    description={_.get(audio, 'description')}
                    isSelected={isSelected}
                    key={audio.id}
                    onSelect={this._handleSelect.bind(this, audio)}
                    title={_.get(audio, 'title')}
                    width={width}
                />
            );
        });

        return (
            <div className="audioGrid">
                {audioItems}
            </div>
        );
    }
}

AudioGrid.propTypes = {
    columns: React.PropTypes.number,
    audios: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func,
    padding: React.PropTypes.number,
    selectedAudios: React.PropTypes.array
};

AudioGrid.defaultProps = {
    columns: 3,
    audios: [],
    padding: 10,
    selectedAudios: []
};

export { AudioGrid, AudioItem };
