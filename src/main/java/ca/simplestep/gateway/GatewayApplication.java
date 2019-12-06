package ca.simplestep.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayApplication.class, args);
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
