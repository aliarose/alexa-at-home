/**
 * This sample demonstrates a simple driver  built against the Alexa Lighting Api.
 * For additional details, please refer to the Alexa Lighting API developer documentation
 * https://developer.amazon.com/public/binaries/content/assets/html/alexa-lighting-api.html
 */
var https = require('https');
var REMOTE_CLOUD_HOSTNAME = 'aligor.hopto.org';

/**
 * Main entry point.
 * Incoming events from Alexa Lighting APIs are processed via this method.
 */
exports.handler = function(event, context) {

    log('Input', event);

    switch (event.header.namespace) {

        /**
         * The namespace of "Discovery" indicates a request is being made to the lambda for
         * discovering all appliances associated with the customer's appliance cloud account.
         * can use the accessToken that is made available as part of the payload to determine
         * the customer.
         */
        case 'Alexa.ConnectedHome.Discovery':
            handleDiscovery(event, context);
            break;

            /**
             * The namespace of "Control" indicates a request is being made to us to turn a
             * given device on, off or brighten. This message comes with the "appliance"
             * parameter which indicates the appliance that needs to be acted on.
             */
        case 'Alexa.ConnectedHome.Control':
            handleControl(event, context);
            break;

            /**
             * We received an unexpected message
             */
        default:
            log('Err', 'No supported namespace: ' + event.header.namespace);
            context.fail('Something went wrong');
            break;
    }
};

/**
 * This method is invoked when we receive a "Discovery" message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given
 * customer.
 */
function handleDiscovery(accessToken, context) {

    /**
     * Crafting the response header
     */
    var headers = {
        namespace: 'Alexa.ConnectedHome.Discovery',
        name: 'DiscoverAppliancesResponse',
        payloadVersion: '2'
    };

    /**
     * Response body will be an array of discovered devices.
     */
    var appliances = [];

    var applianceDiscovered = {
        applianceId: 'screen',
        manufacturerName: 'Aligor',
        modelName: 'a1',
        version: 'v1',
        friendlyName: 'Screen',
        friendlyDescription: 'the screen',
        isReachable: true,
        actions:[
            "turnOn",
            "turnOff"
        ],
        additionalApplianceDetails: { }
    };
    appliances.push(applianceDiscovered);

    /**
     * Craft the final response back to Alexa Smart Home Skill. This will include all the
     * discoverd appliances.
     */
    var payloads = {
        discoveredAppliances: appliances
    };
    var result = {
        header: headers,
        payload: payloads
    };

    log('Discovery', result);

    context.succeed(result);
}

/**
 * Control events are processed here.
 * This is called when Alexa requests an action (IE turn off appliance).
 */
function handleControl(event, context) {
  var eventConfirmation = event.header.name.replace("Request", "Confirmation");

  log('done with result');
  var headers = {
      namespace: 'Alexa.ConnectedHome.Control',
      name: eventConfirmation,
      payloadVersion: '2'
  };
  var payloads = {
      success: true
  };
  var result = {
      header: headers,
      payload: payloads
  };
  log('Done with result', result);
  context.succeed(result);
  // /**
  //  * Retrieve the appliance id and accessToken from the incoming message.
  //  */
  // var applianceId = event.payload.appliance.applianceId;
  // var accessToken = event.payload.accessToken.trim();
  // log('applianceId', applianceId);
  //
  // /**
  //  * Make a remote call to execute the action
  //  */
  // var options = {
  //     hostname: REMOTE_CLOUD_HOSTNAME,
  //     port: 443,
  //     path: '/' + applianceId + '/' + event.header.name + '?access_token=' + accessToken,
  //     headers: {
  //         accept: '*/*'
  //     }
  // };
  //
  // var serverError = function (e) {
  //     log('Error', e.message);
  //     /**
  //      * Craft an error response back to Alexa Smart Home Skill
  //      */
  //     context.fail(generateDependentServiceError());
  // };
  //
  // var callback = function(response) {
  //     var str = '';
  //
  //     response.on('data', function(chunk) {
  //         str += chunk.toString('utf-8');
  //     });
  //
  //     response.on('end', function() {
  //         /**
  //          * Test the response from remote endpoint (not shown) and craft a response message
  //          * back to Alexa Smart Home Skill
  //          */
  //         var eventConfirmation = event.header.name.replace("Request", "Confirmation");
  //
  //         log('done with result');
  //         var headers = {
  //             namespace: 'Control',
  //             name: eventConfirmation,
  //             payloadVersion: '2'
  //         };
  //         var payloads = {
  //             success: true
  //         };
  //         var result = {
  //             header: headers,
  //             payload: payloads
  //         };
  //         log('Done with result', result);
  //         context.succeed(result);
  //     });
  //
  //     response.on('error', serverError);
  // };
  //
  // /**
  //  * Make an HTTPS call to remote endpoint.
  //  */
  // https.get(options, callback)
  //     .on('error', serverError).end();

}

/**
 * Utility functions.
 */
function log(title, msg) {
    console.log('*************** ' + title + ' *************');
    console.log(msg);
    console.log('*************** ' + title + ' End*************');
}

function generateDependentServiceError() {
    var headers = {
      namespace: 'Alexa.ConnectedHome.Control',
      name: "DependentServiceUnavailableError",
      payloadVersion: '2'
    };

    var payload = {
      dependentServiceName: "Our Raspberry Pi"
    };

    var result = {
        header: headers,
        payload: payload
    };

    return result;
}
