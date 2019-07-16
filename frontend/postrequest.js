// Posts comments via AJAX (postrequest.js)
HashOver.prototype.postRequest = function (destination, form, button, callback, type, permalink, close, isReply, isEdit)
{
	// Form inputs
	var inputs = form.elements;

	// Initial request queries
	var queries = [];

	// Reference to this object
	var hashover = this;

	// AJAX response handler
	function commentHandler (json)
	{
		// Check if JSON includes a comment
		if (json.comment !== undefined) {
			// If so, execute callback function
			callback.apply (hashover, [ json, permalink, destination, isReply ]);

			// Execute callback function if one was provided
			if (typeof (close) === 'function') {
				close ();
			}

			// Get the comment element by its permalink
			var scrollToElement = hashover.getElement (json.comment.permalink);

			// Scroll comment into view
			scrollToElement.scrollIntoView ({
				behavior: 'smooth',
				block: 'start',
				inline: 'start'
			});

			// And clear the comment form
			form.comment.value = '';
		} else {
			// If not, display the message return instead
			hashover.showMessage (json.message, type, permalink, (json.type === 'error'), isReply, isEdit);
			return false;
		}

		// Re-enable button on success
		setTimeout (function () {
			button.disabled = false;
		}, 1000);
	}

	// Sends a request to post a comment
	function sendRequest ()
	{
		// Create post comment request queries
		var postQueries = queries.concat ([ 'post=' + encodeURIComponent (form.post.value) ]);

		// Send request to post a comment
		hashover.ajax ('POST', form.action, postQueries, commentHandler, true);
	}

	// Get all form input names and values
	for (var i = 0, il = inputs.length; i < il; i++) {
		// Skip submit inputs
		if (inputs[i].type === 'submit') {
			continue;
		}

		// Skip unchecked checkboxes
		if (inputs[i].type === 'checkbox' && inputs[i].checked !== true) {
			continue;
		}

		// Otherwise, get encoded input value
		var value = encodeURIComponent (inputs[i].value);

		// Add query to queries array
		queries.push (inputs[i].name + '=' + value);
	}

	// Add final queries
	queries = queries.concat ([
		// Add current client time
		'time=' + HashOver.getClientTime (),

		// Add AJAX indicator
		'ajax=yes'
	]);

	// Check if autologin is enabled and user isn't admin
	if (this.setup['user-is-admin'] !== true
	    && this.setup['uses-auto-login'] !== false)
	{
		// If so, check if the user is logged in
		if (this.setup['user-is-logged-in'] !== true || isEdit === true) {
			// If not, send a login request
			var loginQueries = queries.concat ([ 'login=Login' ]);

			// Send post comment request after login
			this.ajax ('POST', form.action, loginQueries, sendRequest, true);
		} else {
			// If so, send post comment request normally
			sendRequest ();
		}
	} else {
		// If not, send post comment request
		sendRequest ();
	}

	// Re-enable button after 10 seconds
	setTimeout (function () {
		button.disabled = false;
	}, 10000);

	return false;
};
