import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { computed } from 'mobx';
import { Row, Col } from 'react-bootstrap';
import { Element, scrollSpy, animateScroll } from 'react-scroll';

import { RightMenu } from 'src/app/components';
import PrivacySettings from './components/PrivacySettings';
import LinkedAccounts from './components/LinkedAccounts';
import EmailInvitation from './components/EmailInvitation';
import RemoveProfileForm from './components/RemoveProfileForm';

@inject('auth')
@observer
class SettingsPage extends Component {
  @computed
  get rightMenuItems() {
    return [
      { route: 'privacy', textKey: 'user.profile.settings.navigation.privacy' },
      { route: 'connectedWithAccount', textKey: 'user.profile.settings.navigation.connectedWithAccount' },
      { route: 'inviteUsers', textKey: 'user.profile.settings.navigation.inviteUsers' },
      {
        route: 'removeProfile',
        textKey: 'user.profile.settings.navigation.removeProfile',
      },
    ];
  }

  render() {
    const { auth: { user } } = this.props;
    return (
      <div className="container">
        <Row className="form-company-container edit-profile-container">
          <Col smHidden xsHidden md={3} className="edit-profile__user f-alegr">
            <ShortUserInfo userData={user} />
          </Col>
          <Col md={6} className="private-settings">
            <Element id="privacy" className="form-group-wrapper offset">
              <PrivacySettings />
            </Element>
            <Element id="connectedWithAccount" className="form-group-wrapper offset">
              <LinkedAccounts />
            </Element>
            <Element id="inviteUsers" className="form-group-wrapper offset">
              <EmailInvitation />
            </Element>
            <Element id="removeProfile" className="form-group-wrapper offset">
              <RemoveProfileForm />
            </Element>
          </Col>
          <Col md={3} smHidden xsHidden>
            <div className="short-user-info">
              <RightMenu
                menuItems={this.rightMenuItems}
                className="sticky-container"
                fixMenuAt="privacy"
              />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SettingsPage;
