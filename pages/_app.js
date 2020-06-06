import App from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";

class MyApp extends React.Component {
  static async getInitialProps(appContext) {
    const { Component, ctx, router, res } = appContext;
    let childProps;
    if (Component.getInitialProps) {
      childProps = await Component.getInitialProps({
        Component,
        ctx,
        router,
      });
    }

    return { childProps };
  }

  render() {
    const { Component, childProps } = this.props;

    return <Component {...childProps} />;
  }
}

export default MyApp;
