import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Glyphicon,
} from 'react-bootstrap';


class TokenFileControl extends Component {
  onFile(file, input) {
    input.value = '';
    const reader = new FileReader();
    reader.onload = () => {
      const contents = reader.result;
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
              Выберите файл с токеном
              <Glyphicon
                glyph="floppy-disk"
                style={{ paddingLeft: '10px' }}
              />
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