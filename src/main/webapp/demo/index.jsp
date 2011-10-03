<!DOCTYPE html>
<html xmlns:ng="http://angularjs.org" xmlns:stng="http://sencha-touch-angular.org">
<head>
    <title>Sencha Toys</title>
    <script>parent.instrument && parent.instrument(window);</script>
    <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
    <meta name="tablet-startup-screen" content="tablet_startup.png">
    <meta name="phone-startup-screen" content="phone_startup.png">
    <meta name="icon" content="icon.png">
    <meta name="gloss-on-icon" content="false">

    <link rel="stylesheet" href="../lib/sencha-touch.css"/>

    <script src="../lib/angular-0.9.19.js"></script>
    <script src="../lib/sencha-touch-1.1.0.js"></script>
    <script src="../lib/require.js" data-main="../st-angular"></script>

</head>
<body>

<div st:xtype="tabpanel" tab-bar-dock="bottom" id="main" fullscreen="true">
    <jsp:include page="lists.jsp"></jsp:include>
    <jsp:include page="toolbars.jsp"></jsp:include>
</div>

</body>
</html>