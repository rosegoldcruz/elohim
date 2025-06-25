Replicate makes it easy to run machine learning models. You can run the best open-source models with just one line of code, or deploy your own custom models. But sometimes you need more control. That’s where deployments come in.

[](#what-are-deployments)What are deployments?
----------------------------------------------

Deployments give you more control over how your models run. With deployments you can:

*   Roll out new versions of your model without having to edit your code.
*   Auto-scale your models to handle extra load and scale to zero when they’re not being used.
*   Keep instances always on to avoid cold boots.
*   Customize what hardware your models run on.
*   Monitor whether instances are setting up, idle, or processing predictions.
*   Monitor the predictions that are flowing through your model.

Deployments work with both open-source models and your own custom models.

[](#autoscaling)Autoscaling
---------------------------

Deployments auto-scale according to demand. If you send a lot of traffic, they scale up to handle it, and when things are quiet they scale back down, so you only pay for what you need. You can also limit the maximum number of instances the deployment can use to limit your maximum spend, or set a minimum to keep some instances warm and ready for predictions.