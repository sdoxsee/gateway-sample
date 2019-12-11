package ca.simplestep.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationEntryPoint;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.savedrequest.ServerRequestCache;
import org.springframework.security.web.server.savedrequest.WebSessionServerRequestCache;
import org.springframework.security.web.server.util.matcher.AndServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.MediaTypeServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.NegatedServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Collections;
import java.util.Optional;

import static org.springframework.security.config.Customizer.withDefaults;

@EnableWebFluxSecurity 
//@EnableReactiveMethodSecurity
public class SecurityConfiguration {

    @Value("${ui.port}")
    private int uiPort;

    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfiguration(ReactiveClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(csrf -> csrf.csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse()))
            .authorizeExchange(exchanges ->
                exchanges
                    .pathMatchers("/**/*.js").permitAll()
                    .pathMatchers("/**/*.html").permitAll()
                    .pathMatchers("/**/*.css").permitAll()
                    .pathMatchers("/", "/current-user").permitAll()
                    .anyExchange().authenticated()
            )
            .oauth2Login(withDefaults())
            .oauth2Client(withDefaults())
            .requestCache(r -> r.requestCache(serverRequestCache()))
            .logout(logout ->
                logout
                    .logoutSuccessHandler(oidcLogoutSuccessHandler()));
        return http.build();
    }

    private ServerLogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedServerLogoutSuccessHandler oidcLogoutSuccessHandler =
                new OidcClientInitiatedServerLogoutSuccessHandler(this.clientRegistrationRepository);
        oidcLogoutSuccessHandler.setPostLogoutRedirectUri(
                URI.create("http://localhost:" + this.uiPort));
        return oidcLogoutSuccessHandler;
    }

    ServerRequestCache serverRequestCache() {
    return new WebSessionServerRequestCache() {
        private final String DEFAULT_SAVED_REQUEST_ATTR = "SPRING_SECURITY_SAVED_REQUEST";
        private final ServerWebExchangeMatcher serverWebExchangeMatcher = createDefaultRequestMatcher();

        @Override
        public Mono<Void> saveRequest(ServerWebExchange exchange) {
            Optional<String> referrer = Optional.ofNullable(
                    exchange.getRequest().getHeaders().getFirst("referer"));

            return this.serverWebExchangeMatcher.matches(exchange)
                    .filter(m -> m.isMatch())
                    .flatMap(m -> exchange.getSession())
                    .map(WebSession::getAttributes)
                    .doOnNext(attrs -> attrs.put(DEFAULT_SAVED_REQUEST_ATTR, referrer.orElse("")))
                    .then();
        }

        private ServerWebExchangeMatcher createDefaultRequestMatcher() {
            ServerWebExchangeMatcher get = ServerWebExchangeMatchers.pathMatchers(HttpMethod.GET, "/**");
            ServerWebExchangeMatcher notFavicon = new NegatedServerWebExchangeMatcher(ServerWebExchangeMatchers.pathMatchers("/favicon.*"));
            MediaTypeServerWebExchangeMatcher html = new MediaTypeServerWebExchangeMatcher(MediaType.TEXT_HTML);
            html.setIgnoredMediaTypes(Collections.singleton(MediaType.ALL));
            return new AndServerWebExchangeMatcher(get, notFavicon, html);
        }
    };
}
}