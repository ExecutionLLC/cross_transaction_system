import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Glyphicon,
} from 'react-bootstrap';


class TokenFileControl extends Component {
  onFile(file, input) {
    // eslint-disable-next-line no-param-reassign
    input.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result;
      // eslint-disable-next-line react/destructuring-assignment,react/prop-types
      this.props.onText(contents);
    };
    reader.readAsText(file);
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel
          htmlFor="fileUpload"
          style={{ cursor: 'pointer' }}
        >
          <h3>
            <span className="file-input-wrapper btn btn-default btn-primary login-form-btn">
              <Glyphicon
                glyph="cog"
                style={{ paddingRight: '10px' }}
              />
              Выберите файл с токеном...
            </span>
          </h3>
          <FormControl
            id="fileUpload"
            type="file"
            accept=".token"
            onChange={evt => this.onFile(evt.target.files[0], evt.target)}
            style={{ display: 'none' }}
          />
        </ControlLabel>
      </FormGroup>
    );
  }
}

export default TokenFileControl;
