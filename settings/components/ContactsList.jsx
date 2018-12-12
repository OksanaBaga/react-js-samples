import React from 'react';
import { inject, observer } from 'mobx-react';
import { Col, Button, Row } from 'react-bootstrap';
import ReactImageFallback from 'react-image-fallback';

import { injectIntl, PropTypes, getDefaultImage } from 'src/utils';

@inject('user')
@injectIntl
@observer
class ContactsList extends React.Component {
  static propTypes = {
    usersToInvite: PropTypes.objectOrObservableObject.isRequired,
    onSelect: PropTypes.func.isRequired,
  };

  toggleClassName = username =>
    `recomend-teaser with-submits ${this.props.usersToInvite.has(username) ? 'active' : ''}`;

  render() {
    const {
      props: {
        onSelect,
        user: {
          list: contacts,
        },
      },
      toggleClassName,
    } = this;

    return (
      <div className="scrolled-content">
        <Row>
          <Col sm={10}>
            {
              contacts.map(user => (
                <Button
                  key={user.username}
                  id={user.username}
                  bsStyle="link"
                  className={toggleClassName(user.username)}
                  onClick={onSelect}
                >
                  <div className="recomend-teaser__img">
                    <ReactImageFallback
                      src={user.photoUrl}
                      fallbackImage={getDefaultImage().user}
                      initialImage={getDefaultImage().user}
                      className="fallback-image"
                    />
                  </div>
                  <div className="recomend-teaser__content">
                    <div className="recomend-teaser__content_name">
                      <div className="bold">{user.name || user.username}</div>
                    </div>
                  </div>
                </Button>
                ))
              }
          </Col>
        </Row>
      </div>
    );
  }
}

export default ContactsList;
