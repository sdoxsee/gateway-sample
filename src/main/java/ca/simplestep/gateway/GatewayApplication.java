package ca.simplestep.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.reactive.result.view.CsrfRequestDataValueProcessor;
import org.springframework.security.web.server.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.EnableWebFlux;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.security.Principal;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.web.reactive.function.BodyInserters.fromValue;
import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RequestPredicates.contentType;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
	}

}

@Configuration
@EnableWebFlux
class WebConfig implements WebFluxConfigurer {

	@Bean
	RouterFunction<ServerResponse> home(MyHandler myController) {
		return route(GET("/current-user"), myController::get)
				.andRoute(GET("/private"), myController::getPrivate);
	}

	@Bean
	WebFilter addCsrfToken() {
		return (exchange, next) -> exchange
				.<Mono<CsrfToken>>getAttribute(CsrfToken.class.getName())
				.doOnSuccess(token -> exchange
						.getAttributes().put(CsrfRequestDataValueProcessor.DEFAULT_CSRF_ATTR_NAME, token))
				.then(next.filter(exchange));
	}
}

@Component
class MyHandler {

	public Mono<ServerResponse> get(ServerRequest request) {
		return request.principal()
				.map(Principal::getName)
				.flatMap(n -> ok().bodyValue(n));
	}

	public Mono<ServerResponse> getPrivate(ServerRequest serverRequest) {
		return ServerResponse.temporaryRedirect(URI.create("/")).build();
	}
}

// https://github.com/spring-projects/spring-boot/issues/9785
@Component
class CustomWebFilter implements WebFilter {
	@Override
	public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
		if (exchange.getRequest().getURI().getPath().equals("/")) {
			return chain.filter(exchange.mutate().request(exchange.getRequest().mutate().path("/index.html").build()).build());
		}

		return chain.filter(exchange);
	}
}

// deal with this? https://stackoverflow.com/a/57795143/1098564