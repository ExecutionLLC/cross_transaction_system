import React, { Component } from 'react';
import { Text, TouchableHighlight } from 'react-native';
import {
  Container,
  Header,
  Form,
  Item,
  Input,
  Content,
  Body,
  Title,
  Button,
  Left,
} from 'native-base';
import SmallSpinner from '../Components/SmallSpinner';
import api from '../API/api';


class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.url,
      isLoading: false,
      error: null,
    };
  }

  onUrlChange(url) {
    this.setState({
      url
    });
  }

  validate() {
    const { url } = this.state;
    return /^\S+:\/\/\S+\/$/.test(url);
  }

  onSubmit() {
    const { onUrl } = this.props;
    const { url } = this.state;
    const isValid = this.validate();
    if (!isValid) {
      this.setState({
        error: {
          message: 'Неправильный формат адреса, пример: http://example.com/',
          urlError: true,
        },
      });
      return;
    }
    this.setState({
      isLoading: true,
      error: null,
    });
    api.checkBaseUrl(url)
      .then(() => {
        this.setState({
          isLoading: false,
          error: null,
        });
        onUrl(url);
      })
      .catch(error => {
        if (error.code === api.ERRORS.NOT_FOUND) {
          this.setState({
            isLoading: false,
            error: {
              message: 'Некорректный УРЛ',
              urlError: true,
            },
          });
        } else {
          this.setState({
            isLoading: false,
            error,
          });
        }
      });
  }

  render() {
    const {
      url,
      isLoading,
      error,
    } = this.state;
    const { onCancel } = this.props;
    const disabled = !url;
    return (
      <Container>
        <Header>
          <Left>
            <Button
              onPress={onCancel}
            >
              <Text>
                &lt; Завершить
              </Text>
            </Button>
          </Left>
          <Body>
          <Title>Настройки</Title>
          </Body>
        </Header>
        <Content>
          <Form style={{margin: 20, marginTop: 100}}>
            <Item error={error && error.urlError}>
              <Input
                placeholder="УРЛ"
                autoCorrect={false}
                autoCapitalize="none"
                value={url}
                disabled={isLoading}
                onChangeText={url => this.onUrlChange(url)}
              />
            </Item>
            {error && (
              <Text>
                {`Ошибка: ${error.message}`}
              </Text>
            )}
            {isLoading ? (
              <SmallSpinner />
            ) : (
              <TouchableHighlight
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: 50,
                  backgroundColor: '#eee'
                }}
                disabled={disabled}
                onPress={() => this.onSubmit()}
              >
                <Text style={{color: disabled ? 'lightgray' : null, textAlign: 'center'}}>Ввод</Text>
              </TouchableHighlight>
            )}
          </Form>
        </Content>
      </Container>
    );
  }
}


export default Settings;
