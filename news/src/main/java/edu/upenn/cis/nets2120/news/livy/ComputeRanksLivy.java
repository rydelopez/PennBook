package edu.upenn.cis.nets2120.news.livy;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import org.apache.livy.LivyClient;
import org.apache.livy.LivyClientBuilder;

import edu.upenn.cis.nets2120.config.Config;

public class ComputeRanksLivy {
	public static void main(String[] args) throws IOException, URISyntaxException, InterruptedException, ExecutionException {
		
		LivyClient client = new LivyClientBuilder()
				  .setURI(new URI("http://ec2-52-201-74-115.compute-1.amazonaws.com:8998/"))
				  .build();

		try {
			String jar = "target/nets2120-news-1.0-SNAPSHOT.jar";
			
		    System.out.printf("Uploading %s to the Spark context...\n", jar);
		    client.uploadJar(new File(jar)).get();
		  
		    // String sourceFile = Config.BIGGER_SOCIAL_NET_PATH; //.SOCIAL_NET_PATH; 
		    
		    // Run both jobs
		    System.out.printf("Running NewsRankJob...\n");
		    List<MyPair<Integer,Double>> result = client.submit(new NewsRankJob()).get();

			System.out.println("Done");
		} finally {
		    client.stop(true);
		}
	}

}
