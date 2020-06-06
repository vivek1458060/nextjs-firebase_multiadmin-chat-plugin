import React, { Component } from "react";
import ChatBoxWrapper from "./ChatBox.style";

export default class ChatBox extends Component {
  state = {
    msg: "",
  };
  onMsgChange = (e) => this.setState({ msg: e.target.value });
  sendMsg = async (e) => {
    e.preventDefault();
    await this.props.sendMsg(this.state.msg);
    this.setState({ msg: "" });
  };
  render() {
    const { isOpen, messages, isAdmin } = this.props;
    return (
      <ChatBoxWrapper>
        <div
          className="chatbox-holder"
          style={{ width: isAdmin ? "" : "100%" }}
        >
          <div
            className={isOpen ? "chatbox" : "chatbox chatbox-min"}
            style={{
              width: isAdmin ? "300px" : "100%",
              marginRight: isAdmin ? "20px" : "",
            }}
          >
            <div
              className="chatbox-top"
              style={{ cursor: "pointer" }}
              onClick={this.props.openMsgbox}
            >
              <div className="chatbox-avatar">
                <img src="/admin.png" />
              </div>
              <div className="chat-partner-name">
                <span className="status online"></span>
                Tech Support - {isAdmin && "ADMIN"}
              </div>
              <div className="chatbox-icons">
                <span className="material-icons text-primary">close</span>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(({ text, isAdmin, id }) => {
                if (isAdmin) {
                  return (
                    <div className="message-box-holder" key={id}>
                      <div className="message-sender">Admin</div>
                      <div className="message-box message-partner">{text}</div>
                    </div>
                  );
                }
                return (
                  <div className="message-box-holder" key={id}>
                    <div className="message-box">{text}</div>
                  </div>
                );
              })}
            </div>

            <form className="chat-input-holder" onSubmit={this.sendMsg}>
              <input
                className="chat-input"
                value={this.state.msg}
                onChange={this.onMsgChange}
              />
              <button className="message-send">Send</button>
            </form>
          </div>
        </div>
      </ChatBoxWrapper>
    );
  }
}
