package edu.upenn.cis.nets2120.news;

import edu.upenn.cis.nets2120.news.ComputeRanks;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    {  
        ComputeRanks cr = new ComputeRanks();

        try {
            cr.run();
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
