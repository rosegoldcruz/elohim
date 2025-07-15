When you run models on Replicate, some data you provide is deleted automatically after a period of time, and other data you can delete yourself manually. Data retention also differs depending on whether you run a model via the API or on the web.

[](#automatic-data-clean-up)Automatic data clean up
---------------------------------------------------

For predictions created through the API, all input parameters, output values, output files, and logs are automatically removed after an hour, by default. If you’d like to continue using the prediction input and output data, you must save your own copies before it is removed. For tips on how to store prediction data, refer to the [webhooks docs](/docs/topics/webhooks).

Data for predictions created through the web interface is kept for 90 days, unless they are shared or used as an example. Data for shared and example predictions is kept indefinitely.

[](#deleting-predictions-manually)Deleting predictions manually
---------------------------------------------------------------

To manually delete a prediction on the website, go to your dashboard, find the prediction, and look for a **Delete** button on the prediction page. Clicking this button completely removes the prediction from the site, including any output data and output files associated with it.