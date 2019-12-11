Start keycloak on port 9080
`docker-compose -f src/main/docker/keycloak.yml up -d`

Start gateway on port 8080
`./mvnw spring-boot:run`

Start react app on port 3000 that is proxied to 8080
`npm start`

Changing `OAuth2LoginSpec.configure` to
```
protected void configure(ServerHttpSecurity http) {
    ReactiveClientRegistrationRepository clientRegistrationRepository = getClientRegistrationRepository();
    ServerOAuth2AuthorizedClientRepository authorizedClientRepository = getAuthorizedClientRepository();
    OAuth2AuthorizationRequestRedirectWebFilter oauthRedirectFilter = getRedirectWebFilter();
    ServerAuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository =
            getAuthorizationRequestRepository();
    oauthRedirectFilter.setAuthorizationRequestRepository(authorizationRequestRepository);
    oauthRedirectFilter.setRequestCache(http.requestCache.requestCache);

    ReactiveAuthenticationManager manager = getAuthenticationManager();

    AuthenticationWebFilter authenticationFilter = new OAuth2LoginAuthenticationWebFilter(manager, authorizedClientRepository);
    authenticationFilter.setRequiresAuthenticationMatcher(getAuthenticationMatcher());
    authenticationFilter.setServerAuthenticationConverter(getAuthenticationConverter(clientRegistrationRepository));

    authenticationFilter.setAuthenticationSuccessHandler(this.authenticationSuccessHandler);
    authenticationFilter.setAuthenticationFailureHandler(getAuthenticationFailureHandler());
    authenticationFilter.setSecurityContextRepository(this.securityContextRepository);

    MediaTypeServerWebExchangeMatcher htmlMatcher = new MediaTypeServerWebExchangeMatcher(
            MediaType.TEXT_HTML);
    htmlMatcher.setIgnoredMediaTypes(Collections.singleton(MediaType.ALL));
    Map<String, String> urlToText = http.oauth2Login.getLinks();
    String path;
    if (urlToText.size() == 1) {
        path = urlToText.keySet().iterator().next();
    } else {
        path = "/login";
    }
    RedirectServerAuthenticationEntryPoint entryPoint = new RedirectServerAuthenticationEntryPoint(path);
    entryPoint.setRequestCache(http.requestCache.requestCache);
    http.defaultEntryPoints.add(new DelegateEntry(htmlMatcher, entryPoint));

    http.addFilterAt(oauthRedirectFilter, SecurityWebFiltersOrder.HTTP_BASIC);
    http.addFilterAt(authenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION);
}
```
where we simply add the `RequestCache` to the `RedirectServerAuthenticationEntryPoint` does the trick but there's probably a better way

If we don't add the `RequestCache` to the `RedirectServerAuthenticationEntryPoint`, then we get redirected back to 8080 rather than 3000 (as specified in my custom `RequestCache`). I'm trying to do a reactive version (more or less) of https://developer.okta.com/blog/2018/07/19/simple-crud-react-and-spring-boot 