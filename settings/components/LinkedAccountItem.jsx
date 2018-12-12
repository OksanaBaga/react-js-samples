import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Row, Col, Image } from 'react-bootstrap';

import { injectIntl, PropTypes } from 'src/utils';
import { FormCheckboxField } from 'src/app/components';

@inject('auth')
@injectIntl
@observer
class LinkedAccountItem extends Component {
  static propTypes = {
    sn: PropTypes.string.isRequired,
  };

  localise = (key) => {
    const { intl } = this.props;
    return intl.formatMessage({ id: `user.profile.settings.connectedWithAccount.${key}` });
  };

  render() {
    const { sn, intl, auth: { user: { linkedAccounts = {} } } } = this.props;
    const notConnected = this.localise('notConnected');
    return (
      <Row>
        <Col xs={1}>
          <FormCheckboxField
            checked={Object.prototype.hasOwnProperty.call(linkedAccounts, sn)}
              // `checked` prop without an `onChange` handler is forbidden
            onChange={() => {}}
          />
        </Col>
        <Col xs={2}>
          <Image
            src={`/assets/images/socials/${sn}.svg`}
            className="avatar"
            circle
            alt={intl.formatMessage({ id: `image.${sn}` })}
            title={intl.formatMessage({ id: `image.${sn}` })}
          />
        </Col>
        <Col xs={7}>
          <div className="bold">{this.localise(`connectedWith.${sn}`)}</div>
          <div className="grey">
            {(linkedAccounts[sn] && linkedAccounts[sn].name) || notConnected}
          </div>
        </Col>
      </Row>
    );
  }
}

export default LinkedAccountItem;
