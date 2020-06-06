import React, { Component } from "react";
import ChatBox from "../component/chatbox/ChatBox";
import database from "../firebase/firebase";
import Router from "next/router";
import VerifyBoothId from "../utils/verifyBoothId";

class CustomerChat extends Component {
  state = {
    isOpen: false,
    messages: [],
    lastMessageKey: undefined,
  };

  async subscibeMessage(userId) {
    try {
      const boothId = Router.router.query.boothId;
      const lastMessageKey = this.state.lastMessageKey;

      await database
        .ref(`${boothId}/${userId}/messages`)
        .limitToLast(1)
        .on("child_added", (snapshot) => {
          if (lastMessageKey !== snapshot.key) {
            this.setState({
              messages: [
                ...this.state.messages,
                {
                  id: snapshot.key,
                  ...snapshot.val(),
                },
              ],
            });
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  async componentDidMount() {
    try {
      const boothId = Router.router.query.boothId;
      let userId = localStorage.getItem(boothId);
      if (userId) {
        const snapshot = await database
          .ref(`${boothId}/${userId}/messages`)
          .limitToLast(5)
          .once("value");

        let messages = [],
          lastMessageKey = undefined;
        snapshot.forEach((childSnapshot) => {
          messages.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
          lastMessageKey = childSnapshot.key;
        });

        this.setState({ messages, lastMessageKey });
        this.subscibeMessage(userId);
      }
    } catch (e) {
      console.log(e);
    }
  }

  openMsgbox = () => this.setState({ isOpen: !this.state.isOpen });
  sendMsg = async (msg) => {
    const boothId = Router.router.query.boothId;

    try {
      let userId = localStorage.getItem(boothId);
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          msg,
          userId,
          boothId: boothId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => response.json());
      if (!userId) {
        localStorage.setItem(boothId, res.userId);
        this.subscibeMessage(res.userId);
      }
    } catch (e) {
      console.log(e);
      alert("Something went wrong!");
    }
  };
  render() {
    console.log(this.props);
    if (!this.props.isValidBoothId) {
      return <p>Page doesn't exist</p>;
    }

    const { isOpen, messages } = this.state;

    return (
      <ChatBox
        isOpen={isOpen}
        messages={messages}
        sendMsg={this.sendMsg}
        openMsgbox={this.openMsgbox}
      />
    );
  }
}

CustomerChat.getInitialProps = async ({ router }) => {
  try {
    const boothId = router.query["boothId"];

    await VerifyBoothId(boothId, boothId);
    return { isValidBoothId: true };
  } catch (e) {
    console.log(e);
    return {};
  }
};

export default CustomerChat;
