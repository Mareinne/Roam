// Catch any synchronous error that prevents registration
try {
  const { registerRootComponent } = require('expo');
  const App = require('./App').default;
  registerRootComponent(App);
} catch (e: any) {
  // If registration fails, register a fallback that shows the error
  const { AppRegistry } = require('react-native');
  const { Text, View, ScrollView } = require('react-native');
  const React = require('react');
  
  function ErrorApp() {
    return React.createElement(
      View,
      { style: { flex: 1, backgroundColor: '#1E4010', padding: 40, paddingTop: 80 } },
      React.createElement(
        ScrollView,
        null,
        React.createElement(Text, { style: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 } }, '⚠️ Startup Error'),
        React.createElement(Text, { style: { color: '#fff', fontSize: 13, fontFamily: 'monospace' } }, String(e?.message || e))
      )
    );
  }
  
  AppRegistry.registerComponent('main', () => ErrorApp);
}
