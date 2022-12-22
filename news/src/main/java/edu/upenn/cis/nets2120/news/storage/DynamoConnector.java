package edu.upenn.cis.nets2120.storage;

// import org.apache.logging.log4j.LogManager;
// import org.apache.logging.log4j.Logger;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.auth.SystemPropertiesCredentialsProvider;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;

import edu.upenn.cis.nets2120.config.Config;

/**
 * A factory 
 * @author zives
 *
 */
public class DynamoConnector {
	/**
	 * A logger is useful for writing different types of messages
	 * that can help with debugging and monitoring activity.  You create
	 * it and give it the associated class as a parameter -- so in the
	 * config file one can adjust what messages are sent for this class. 
	 */
	// static Logger logger = LogManager.getLogger(DynamoConnector.class);
		
	/**
	 * This is our connection
	 */
	static DynamoDB client;

	/**
	 * Singleton pattern: get the client connection if one exists, else create one
	 * 
	 * @param url
	 * @return
	 */
	public static DynamoDB getConnection(final String url) {
		if (client != null)
			return client;
		
		client = new DynamoDB( 
				AmazonDynamoDBClientBuilder.standard()
				.withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(
					Config.DYNAMODB_URL, "us-east-1"))
				.withCredentials(new DefaultAWSCredentialsProviderChain())
				.build());

    	return client;
	}
	
	/**
	 * Orderly shutdown
	 */
	public static void shutdown() {
		if (client != null) {
			client.shutdown();
			client = null;
		}
		System.out.println("Shut down DynamoDB factory");
	}
}
