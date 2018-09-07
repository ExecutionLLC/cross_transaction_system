import React from 'react';
import {
  Grid, Row, Col,
  Image,
} from 'react-bootstrap';
import hyperledger from './hyperledger_fabric.png';
import execution from './execution.png';


const footerStyle = {
  backgroundColor: 'rgb(231, 231, 231)',
  borderTop: '1px solid #E7E7E7',
  textAlign: 'center',
  padding: '5px',
  position: 'fixed',
  left: '0',
  bottom: '0',
  height: '45px',
  width: '100%',
  margin: 0,
};

function Footer({ children }) {
  return (
    <div>
      <div style={{ marginBottom: '50px' }} />
      <div>
        <div style={footerStyle}>
          <Grid>
            <Row>
              <Col sm={4}>
                <div style={{ fontSize: '18px' }}>
                  Powered by:
                  <span style={{ paddingLeft: '15px' }}>
                    <a href="https://www.hyperledger.org/projects/fabric">
                      <Image src={hyperledger} alt="logo" style={{ maxHeight: '30px' }} />
                    </a>
                  </span>
                </div>
              </Col>
              <Col sm={4}>
                <div style={{ fontSize: '18px' }}>
                  Produced by:
                  <span style={{ paddingLeft: '15px' }}>
                    <a href="https://execution.su/">
                      <Image src={execution} alt="logo" style={{ maxHeight: '25px' }} />
                    </a>
                  </span>
                </div>
              </Col>
              <Col sm={4}>
                <div style={{ fontSize: '16px', paddingTop: '5px' }}>
                  © 2011 - 2018 Execution. All rights reserved.
                </div>
              </Col>
            </Row>
          </Grid>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Footer;
